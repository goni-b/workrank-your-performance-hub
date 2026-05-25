import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CreateInput = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
  full_name: z.string().min(1).max(120),
  role: z.enum(["manager", "employee"]),
  job_title: z.string().max(120).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  start_date: z.string().optional().nullable(),
  team_id: z.string().uuid().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

export const createEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify caller is admin/super_admin
    const { data: caller } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!caller || (caller.role !== "admin" && caller.role !== "super_admin")) {
      throw new Error("רק אדמין יכול ליצור עובדים");
    }
    if (!caller.company_id) {
      throw new Error("אדמין ללא חברה משויכת");
    }

    // Create auth user (admin API) — email auto-confirmed for instant login
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.full_name, role: data.role },
      });

    if (createErr || !created.user) {
      const msg = createErr?.message ?? "שגיאה ביצירת משתמש";
      throw new Error(msg.includes("already") ? "כתובת האימייל כבר רשומה" : msg);
    }

    const newId = created.user.id;

    // Upsert profile (handle_new_user trigger may have inserted defaults)
    const { error: upErr } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newId,
        full_name: data.full_name,
        role: data.role,
        job_title: data.job_title ?? null,
        phone: data.phone ?? null,
        start_date: data.start_date ?? null,
        team_id: data.team_id ?? null,
        company_id: caller.company_id,
        avatar_url: data.avatar_url ?? null,
        status: "active",
      });

    if (upErr) {
      // best-effort cleanup
      await supabaseAdmin.auth.admin.deleteUser(newId);
      throw new Error(upErr.message);
    }

    return { id: newId };
  });

export const updateEmployeeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["active", "frozen", "inactive"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });