import { useState, type CSSProperties, type ReactNode, type ChangeEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createEmployee } from "@/lib/employees.functions";

const INPUT_STYLE: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "#080C14",
  border: "1px solid #1E2D45",
  borderRadius: 8,
  color: "#F1F5F9",
  fontFamily: "Heebo, sans-serif",
  fontSize: 13,
  outline: "none",
  direction: "rtl",
};

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#94A3B8",
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function CreateEmployeeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const create = useServerFn(createEmployee);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "employee" as "manager" | "employee",
    job_title: "",
    phone: "",
    start_date: new Date().toLocaleDateString("en-CA"),
  });

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim()) return toast.error("נא להזין שם מלא");
    if (!form.email.trim()) return toast.error("נא להזין אימייל");
    if (form.password.length < 6) return toast.error("הסיסמה חייבת להכיל לפחות 6 תווים");

    setIsLoading(true);
    try {
      // 1. Create user + profile via server fn
      const { id: newId } = await create({
        data: {
          email: form.email.trim(),
          password: form.password,
          full_name: form.full_name.trim(),
          role: form.role,
          job_title: form.job_title.trim() || null,
          phone: form.phone.trim() || null,
          start_date: form.start_date || null,
        },
      });

      // 2. Upload avatar if present
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `${newId}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          await supabase
            .from("profiles")
            .update({ avatar_url: urlData.publicUrl })
            .eq("id", newId);
        }
      }

      toast.success(`✅ ${form.full_name} נוסף/ה בהצלחה!`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message ?? "שגיאה ביצירת עובד");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#0D1321",
          border: "1px solid #1E2D45",
          borderRadius: 16,
          padding: 28,
          zIndex: 101,
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>הוסף עובד חדש</h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748B",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#1E2D45",
              border: "2px dashed #1E2D45",
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 24 }}>👤</span>
            )}
          </div>
          <label
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #1E2D45",
              color: "#94A3B8",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            העלה תמונה
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormField label="שם מלא *">
            <input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="לדוגמה: דני כהן"
              style={INPUT_STYLE}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="אימייל *">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="dan@company.co.il"
                style={{ ...INPUT_STYLE, direction: "ltr", textAlign: "left" }}
              />
            </FormField>
            <FormField label="טלפון">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="050-0000000"
                style={{ ...INPUT_STYLE, direction: "ltr", textAlign: "left" }}
              />
            </FormField>
          </div>

          <FormField label="סיסמה זמנית *">
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="לפחות 6 תווים"
              style={INPUT_STYLE}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="תפקיד במערכת *">
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value as "manager" | "employee" }))
                }
                style={INPUT_STYLE}
              >
                <option value="employee">עובד</option>
                <option value="manager">מנהל צוות</option>
              </select>
            </FormField>
            <FormField label="כותרת תפקיד">
              <input
                value={form.job_title}
                onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
                placeholder="לדוגמה: קמפיינר"
                style={INPUT_STYLE}
              />
            </FormField>
          </div>

          <FormField label="תאריך תחילת עבודה">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              style={{ ...INPUT_STYLE, direction: "ltr" }}
            />
          </FormField>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 24,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid #1E2D45",
              color: "#94A3B8",
              fontFamily: "Heebo, sans-serif",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              background: isLoading ? "#1D4ED8aa" : "#2563EB",
              border: "none",
              color: "#fff",
              fontFamily: "Heebo, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "⏳ יוצר..." : "✅ צור עובד"}
          </button>
        </div>
      </div>
    </>
  );
}