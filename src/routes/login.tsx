import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getHebrewError } from "@/lib/wr-utils";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); const [loading, setLoading] = useState(false);

  // Quick test login: username 1234 / password 1234 -> mapped to a real admin user
  const QUICK_USER = "1234";
  const QUICK_PASS = "1234";
  const QUICK_EMAIL = "admin1234@workrank.test";
  const QUICK_REAL_PASS = "admin1234";
  const DEFAULT_COMPANY_ID = "f2a6a02f-d0d2-4c9c-aebd-2b92b83e657b";

  const quickAdminLogin = async () => {
    setLoading(true);
    try {
      let { error } = await supabase.auth.signInWithPassword({
        email: QUICK_EMAIL, password: QUICK_REAL_PASS,
      });
      if (error) {
        // Create the admin test user on first run
        const { error: signUpErr } = await supabase.auth.signUp({
          email: QUICK_EMAIL, password: QUICK_REAL_PASS,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: "אדמין בדיקה", role: "admin" },
          },
        });
        if (signUpErr) throw signUpErr;
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: QUICK_EMAIL, password: QUICK_REAL_PASS,
        });
        if (signInErr) throw signInErr;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("profiles").update({
          role: "admin", company_id: DEFAULT_COMPANY_ID, full_name: "אדמין בדיקה",
        }).eq("id", userData.user.id);
      }
      toast.success("התחברת כאדמין");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(getHebrewError(err));
    } finally { setLoading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      // Quick login shortcut: 1234 / 1234
      if (mode === "login" && email.trim() === QUICK_USER && password === QUICK_PASS) {
        setLoading(false);
        await quickAdminLogin();
        return;
      }
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("ברוך הבא!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("נרשמת בהצלחה");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(getHebrewError(err));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="wr-card animate-slide-in" style={{ width: 380, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 14px",
            background: "linear-gradient(135deg, #2563EB, #F59E0B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 28,
          }}>W</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>WorkRank</h1>
          <p style={{ color: "#64748B", fontSize: 13, marginTop: 6 }}>
            {mode === "login" ? "ברוך הבא, התחבר לחשבונך" : "הרשמה למערכת"}
          </p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <div>
              <label className="wr-label">שם מלא</label>
              <input className="wr-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="wr-label">אימייל</label>
            <input className="wr-input" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="wr-label">סיסמה</label>
            <input className="wr-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="wr-btn-primary" style={{ width: "100%", marginTop: 6 }} disabled={loading}>
            {loading ? "..." : mode === "login" ? "כניסה" : "הרשמה"}
          </button>
        </form>
        <button
          type="button"
          onClick={quickAdminLogin}
          disabled={loading}
          style={{
            width: "100%", marginTop: 12, padding: "10px 14px", borderRadius: 10,
            border: "1px dashed #3B82F6", background: "rgba(59,130,246,0.08)",
            color: "#3B82F6", fontWeight: 700, cursor: "pointer", fontFamily: "Heebo",
          }}
        >
          ⚡ כניסה מהירה כאדמין (1234 / 1234)
        </button>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "#64748B" }}>
          {mode === "login" ? "אין לך חשבון? " : "כבר רשום? "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontWeight: 700, fontFamily: "Heebo" }}>
            {mode === "login" ? "הרשם" : "התחבר"}
          </button>
        </div>
      </div>
    </div>
  );
}
