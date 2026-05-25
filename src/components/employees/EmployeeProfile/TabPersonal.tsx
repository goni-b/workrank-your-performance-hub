import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/hooks/useEmployees";

const INPUT: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "#080C14", border: "1px solid #1E2D45",
  borderRadius: 8, color: "#F1F5F9",
  fontFamily: "Heebo, sans-serif", fontSize: 13,
  outline: "none", direction: "rtl",
};

export function TabPersonal({ employee }: { employee: Employee }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: employee.full_name,
    job_title: employee.job_title ?? "",
    phone: employee.phone ?? "",
    start_date: employee.start_date ?? "",
    notes: employee.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      full_name: employee.full_name,
      job_title: employee.job_title ?? "",
      phone: employee.phone ?? "",
      start_date: employee.start_date ?? "",
      notes: employee.notes ?? "",
    });
  }, [employee.id]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        job_title: form.job_title.trim() || null,
        phone: form.phone.trim() || null,
        start_date: form.start_date || null,
        notes: form.notes.trim() || null,
      })
      .eq("id", employee.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("✅ הפרטים עודכנו");
    qc.invalidateQueries({ queryKey: ["employee", employee.id] });
    qc.invalidateQueries({ queryKey: ["employees"] });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600 }}>
      <Field label="שם מלא">
        <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} style={INPUT} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="כותרת תפקיד">
          <input value={form.job_title} onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))} style={INPUT} />
        </Field>
        <Field label="טלפון">
          <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={{ ...INPUT, direction: "ltr", textAlign: "left" }} />
        </Field>
      </div>
      <Field label="תאריך תחילת עבודה">
        <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} style={{ ...INPUT, direction: "ltr" }} />
      </Field>
      <Field label="הערות">
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={4}
          style={{ ...INPUT, resize: "vertical" }}
        />
      </Field>
      <div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "10px 24px", borderRadius: 8,
            background: saving ? "#1D4ED8aa" : "#2563EB",
            border: "none", color: "#fff",
            fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "שומר..." : "💾 שמור שינויים"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}