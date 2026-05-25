import { Timer } from "lucide-react";

export function ClockSkeleton() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>שעון נוכחות</h2>

      <div className="wr-card" style={{ padding: 40, textAlign: "center", marginBottom: 16 }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "var(--wr-bg-primary)", border: "3px solid var(--wr-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <Timer size={40} color="#94A3B8" />
        </div>

        <p style={{ color: "var(--wr-text-muted)", marginBottom: 20 }}>
          טרם נכנסת לעבודה היום
        </p>

        <button className="wr-btn-checkin">
          🟢 כניסה לעבודה
        </button>

        <p style={{ color: "var(--wr-text-muted)", fontSize: 12, marginTop: 16 }}>
          הפונקציונליות תפעל לאחר Milestone 2
        </p>
      </div>

      <div className="wr-card wr-card-glow-gold" style={{ padding: 20 }}>
        <p style={{ color: "var(--wr-text-muted)", fontSize: 13, textAlign: "center", margin: 0 }}>
          🏆 פרסים יוצגו כאן לאחר Milestone 6
        </p>
      </div>
    </div>
  );
}