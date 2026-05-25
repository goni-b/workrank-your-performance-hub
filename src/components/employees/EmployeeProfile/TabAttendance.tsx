import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Att = {
  id: string;
  date: string;
  type: "work" | "sick" | "vacation" | "constraint";
  check_in: string | null;
  check_out: string | null;
};

const DAY_BG: Record<string, string> = {
  work: "#10B98120",
  sick: "#EF444420",
  vacation: "#2563EB20",
  constraint: "#F59E0B20",
};

export function TabAttendance({ employeeId }: { employeeId: string }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1); d.setHours(0, 0, 0, 0);
    return d;
  });

  const start = new Date(month.getFullYear(), month.getMonth(), 1).toLocaleDateString("en-CA");
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0).toLocaleDateString("en-CA");

  const { data: records = [] } = useQuery({
    queryKey: ["employee-attendance", employeeId, start],
    enabled: !!employeeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("id, date, type, check_in, check_out")
        .eq("user_id", employeeId)
        .gte("date", start)
        .lte("date", end)
        .order("date");
      return (data ?? []) as Att[];
    },
  });

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const recordMap = Object.fromEntries(records.map((r) => [r.date, r]));
  const todayStr = new Date().toLocaleDateString("en-CA");

  const workRecords = records.filter((r) => r.type === "work");
  const totalMin = workRecords.reduce((s, r) => {
    if (!r.check_in || !r.check_out) return s;
    return s + Math.floor((new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 60000);
  }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
        <button
          onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          style={navBtn}
        >
          ←
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, minWidth: 140, textAlign: "center" }}>
          {month.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          style={navBtn}
        >
          →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#64748B", padding: "4px 0", fontWeight: 600 }}>
            {d}
          </div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
          const dateStr = date.toLocaleDateString("en-CA");
          const record = recordMap[dateStr];
          const isWeekend = date.getDay() === 5 || date.getDay() === 6;
          const isToday = dateStr === todayStr;
          const isFuture = date > new Date();
          const bg = record ? DAY_BG[record.type] : "transparent";
          return (
            <div
              key={i}
              title={record ? `${record.type} — ${dateStr}` : dateStr}
              style={{
                aspectRatio: "1",
                borderRadius: 8,
                background: isToday ? "#2563EB20" : bg,
                border: isToday ? "1px solid #2563EB" : "1px solid transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: isToday ? 700 : 400,
                color: isFuture ? "#1E2D45" : "#F1F5F9",
                opacity: isWeekend ? 0.4 : 1,
              }}
            >
              {i + 1}
              {record?.check_in && (
                <span style={{ fontSize: 8, color: "#10B981", marginTop: 1 }}>
                  {new Date(record.check_in).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { color: "#10B981", label: "יום עבודה" },
          { color: "#EF4444", label: "מחלה" },
          { color: "#2563EB", label: "חופשה" },
          { color: "#F59E0B", label: "אילוץ" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color + "40", border: `1px solid ${item.color}66` }} />
            <span style={{ fontSize: 11, color: "#64748B" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#111827", borderRadius: 12, border: "1px solid #1E2D45", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr", padding: "10px 16px", borderBottom: "1px solid #1E2D45", fontSize: 11, color: "#64748B", fontWeight: 700 }}>
          <span>תאריך</span><span>יום</span><span>כניסה</span><span>יציאה</span><span>שעות</span>
        </div>
        {workRecords.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#64748B", fontSize: 12 }}>
            אין ימי עבודה בחודש זה
          </div>
        )}
        {workRecords.map((r) => {
          const d = new Date(r.date);
          const hours = r.check_in && r.check_out
            ? (() => {
                const diff = new Date(r.check_out!).getTime() - new Date(r.check_in!).getTime();
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                return `${h}:${m.toString().padStart(2, "0")}`;
              })()
            : "–";
          return (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr", padding: "9px 16px", borderBottom: "1px solid #1E2D4530", fontSize: 12 }}>
              <span style={{ direction: "ltr" }}>{d.toLocaleDateString("he-IL")}</span>
              <span>{d.toLocaleDateString("he-IL", { weekday: "long" })}</span>
              <span style={{ direction: "ltr" }}>
                {r.check_in ? new Date(r.check_in).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "–"}
              </span>
              <span style={{ direction: "ltr" }}>
                {r.check_out ? new Date(r.check_out).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "–"}
              </span>
              <span style={{ color: "#10B981", direction: "ltr" }}>{hours}</span>
            </div>
          );
        })}
        {workRecords.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr", padding: "10px 16px", background: "#2563EB10", fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>
            <span>סה"כ</span>
            <span>{workRecords.length} ימים</span>
            <span></span><span></span>
            <span style={{ direction: "ltr" }}>
              {Math.floor(totalMin / 60)}:{(totalMin % 60).toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1E2D45",
  borderRadius: 8,
  padding: "6px 12px",
  color: "#94A3B8",
  cursor: "pointer",
  fontFamily: "Heebo, sans-serif",
};