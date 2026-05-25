import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({ component: Unauthorized });

function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: "var(--wr-bg-primary)", gap: 16, textAlign: "center", padding: 20,
    }}>
      <div style={{ fontSize: 64 }}>🚫</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>גישה נדחתה</h1>
      <p style={{ color: "var(--wr-text-muted)", fontSize: 14, margin: 0 }}>
        אין לך הרשאה לגשת לעמוד זה
      </p>
      <button
        onClick={() => navigate({ to: "/login" })}
        className="wr-btn-primary"
        style={{ marginTop: 8 }}
      >
        חזור לדף הכניסה
      </button>
    </div>
  );
}