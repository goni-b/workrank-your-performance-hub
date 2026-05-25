import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function TabPoints({ employeeId }: { employeeId: string }) {
  const { data: history = [] } = useQuery({
    queryKey: ["employee-points", employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("points")
        .select("id, amount, reason, created_at, approved_by")
        .eq("user_id", employeeId)
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const total = history.reduce((s, p) => s + (p.amount ?? 0), 0);
  const monthStart = (() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; })();
  const monthTotal = history
    .filter((p) => new Date(p.created_at) >= monthStart)
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <Stat label="נקודות החודש" value={monthTotal} color="#FCD34D" />
        <Stat label="סה״כ נקודות" value={total} color="#10B981" />
      </div>

      <div style={{ background: "#111827", borderRadius: 12, border: "1px solid #1E2D45", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2D45", fontWeight: 700, fontSize: 13 }}>
          היסטוריית נקודות
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#64748B", fontSize: 12 }}>
            אין נקודות עדיין
          </div>
        ) : (
          history.map((p) => (
            <div key={p.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 16px", borderBottom: "1px solid #1E2D4530", fontSize: 12,
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.reason ?? "ללא סיבה"}</div>
                <div style={{ color: "#64748B", fontSize: 11, marginTop: 2, direction: "ltr", textAlign: "right" }}>
                  {new Date(p.created_at).toLocaleString("he-IL")}
                </div>
              </div>
              <div style={{
                color: (p.amount ?? 0) >= 0 ? "#FCD34D" : "#EF4444",
                fontWeight: 800, fontSize: 14,
              }}>
                {(p.amount ?? 0) >= 0 ? "+" : ""}{p.amount} ⭐
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "#111827", border: "1px solid #1E2D45",
      borderRadius: 12, padding: 16,
    }}>
      <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{label}</div>
    </div>
  );
}