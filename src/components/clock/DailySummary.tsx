interface Props {
  timerDisplay: string;
  checkInTime: string | null;
}

export function DailySummary({ timerDisplay, checkInTime }: Props) {
  const items = [
    { label: "כניסה", value: checkInTime ?? "--:--" },
    { label: "שעות עבודה", value: timerDisplay },
    { label: "נקודות שנצברו", value: "+5 ⭐" },
  ];
  return (
    <div className="wr-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "var(--wr-text)" }}>
        📊 סיכום יום
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {items.map((it) => (
          <div key={it.label} style={{
            background: "var(--wr-bg-surface)",
            border: "1px solid var(--wr-border)",
            borderRadius: 10, padding: "12px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--wr-text)", direction: "ltr" }}>
              {it.value}
            </div>
            <div style={{ fontSize: 11, color: "var(--wr-text-muted)", marginTop: 4 }}>
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}