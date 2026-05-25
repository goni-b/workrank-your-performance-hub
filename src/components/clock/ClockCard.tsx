interface Props {
  isClockedIn: boolean;
  isCheckedOut: boolean;
  timerDisplay: string;
  checkInTime: string | null;
  isSaving: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export function ClockCard({
  isClockedIn, isCheckedOut, timerDisplay,
  checkInTime, isSaving, onCheckIn, onCheckOut,
}: Props) {
  const statusLabel = isClockedIn ? "בעבודה" : isCheckedOut ? "סיים היום" : "לא נכנס";
  const statusColor = isClockedIn ? "#10B981" : isCheckedOut ? "#94A3B8" : "#F59E0B";

  return (
    <div
      className={`wr-card ${isClockedIn ? "wr-card-glow-green" : isCheckedOut ? "" : "wr-card-glow-gold"}`}
      style={{ padding: 32, textAlign: "center" }}
    >
      {/* Status badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 14px", borderRadius: 99,
        background: `${statusColor}1f`, border: `1px solid ${statusColor}55`,
        marginBottom: 20,
      }}>
        <span className="wr-status-dot" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
        <span style={{ color: statusColor, fontWeight: 700, fontSize: 12 }}>{statusLabel}</span>
      </div>

      {/* Circle icon with pulse */}
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 24px" }}>
        {isClockedIn && (
          <div
            className="animate-pulse-ring"
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "3px solid #10B981",
            }}
          />
        )}
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: "var(--wr-bg-primary)",
          border: `3px solid ${isClockedIn ? "#10B981" : isCheckedOut ? "#475569" : "var(--wr-border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 44,
        }}>
          {isClockedIn ? "🟢" : isCheckedOut ? "✅" : "⏱"}
        </div>
      </div>

      {!isClockedIn && !isCheckedOut && (
        <>
          <p style={{ color: "var(--wr-text-sub)", marginBottom: 18, fontSize: 15 }}>
            טרם נכנסת לעבודה היום
          </p>
          <button className="wr-btn-checkin" onClick={onCheckIn} disabled={isSaving}>
            {isSaving ? "⏳ שומר..." : "🟢 כניסה לעבודה"}
          </button>
          <p style={{ color: "var(--wr-gold)", fontSize: 12, marginTop: 14, fontWeight: 600 }}>
            +5 נקודות על כניסה לעבודה ⭐
          </p>
        </>
      )}

      {isClockedIn && (
        <>
          <p style={{ color: "var(--wr-text-sub)", marginBottom: 14, fontSize: 14 }}>
            בעבודה מאז {checkInTime}
          </p>
          <div
            className="animate-tick"
            style={{
              direction: "ltr",
              fontSize: 48, fontWeight: 800, color: "#10B981",
              letterSpacing: 2, marginBottom: 6,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timerDisplay}
          </div>
          <p style={{ color: "var(--wr-text-muted)", fontSize: 12, marginBottom: 22 }}>
            שעות עבודה היום
          </p>
          <button className="wr-btn-checkout" onClick={onCheckOut} disabled={isSaving}>
            {isSaving ? "⏳ שומר..." : "🔴 יציאה מהעבודה"}
          </button>
        </>
      )}

      {isCheckedOut && (
        <>
          <p style={{ color: "var(--wr-green)", marginBottom: 8, fontSize: 16, fontWeight: 700 }}>
            יום עבודה הושלם ✅
          </p>
          <p style={{ color: "var(--wr-text-sub)", fontSize: 14, marginBottom: 4 }}>
            עבדת {timerDisplay} היום
          </p>
          <p style={{ color: "var(--wr-text-muted)", fontSize: 12 }}>
            כניסה: {checkInTime}
          </p>
        </>
      )}
    </div>
  );
}