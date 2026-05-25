export function PagePlaceholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ color: "#64748B", marginTop: 6, fontSize: 13 }}>{subtitle}</p>}
      <div className="wr-card" style={{ marginTop: 20, textAlign: "center", padding: 60, color: "#64748B" }}>
        זמין בשלב הבא של הפיתוח
      </div>
    </div>
  );
}
