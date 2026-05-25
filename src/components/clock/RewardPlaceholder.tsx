export function RewardPlaceholder() {
  return (
    <div className="wr-card wr-card-glow-gold" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "rgba(245,158,11,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, flexShrink: 0,
      }}>🏆</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wr-text)", marginBottom: 6 }}>
          הפרס הבא שלך
        </div>
        <div className="wr-progress-track" style={{ marginBottom: 6 }}>
          <div className="wr-progress-fill" style={{ width: "0%", background: "linear-gradient(90deg,#F59E0B,#FCD34D)" }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--wr-text-muted)" }}>
          פרסים יופיעו כאן לאחר הגדרתם – Milestone 6
        </div>
      </div>
    </div>
  );
}