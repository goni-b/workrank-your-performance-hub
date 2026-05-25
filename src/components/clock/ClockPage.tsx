import { useAttendance } from "@/hooks/useAttendance";
import { ClockSkeleton } from "@/components/wr/ClockSkeleton";
import { ClockCard } from "./ClockCard";
import { RewardPlaceholder } from "./RewardPlaceholder";
import { DailySummary } from "./DailySummary";

export default function ClockPage() {
  const {
    isClockedIn, isCheckedOut,
    timerDisplay, checkInTime,
    isSaving, isLoading,
    checkIn, checkOut,
    isOnBreak, startBreak, endBreak,
  } = useAttendance();

  if (isLoading) return <ClockSkeleton />;

  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }} className="animate-slide-in">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "var(--wr-text)" }}>שעון נוכחות</h1>
        <p style={{ fontSize: 13, color: "var(--wr-text-sub)", margin: "4px 0 0" }}>{today}</p>
      </div>

      <ClockCard
        isClockedIn={isClockedIn}
        isCheckedOut={isCheckedOut}
        timerDisplay={timerDisplay}
        checkInTime={checkInTime}
        isSaving={isSaving}
        onCheckIn={checkIn}
        onCheckOut={checkOut}
        isOnBreak={isOnBreak}
        onStartBreak={startBreak}
        onEndBreak={endBreak}
      />

      <div style={{ marginTop: 16 }}>
        <RewardPlaceholder />
      </div>

      {isCheckedOut && (
        <div style={{ marginTop: 16 }}>
          <DailySummary timerDisplay={timerDisplay} checkInTime={checkInTime} />
        </div>
      )}
    </div>
  );
}