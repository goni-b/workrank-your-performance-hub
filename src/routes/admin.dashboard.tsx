import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import { WrAvatar } from "@/components/wr/Avatar";
import { Users, Clock, ClipboardCheck, Trophy } from "lucide-react";
import { HEBREW_MONTHS, todayISO } from "@/lib/wr-utils";

export const Route = createFileRoute("/admin/dashboard")({ component: () => <RequireAuth roles={["admin","super_admin"]}><Dashboard/></RequireAuth> });

function StatCard({ label, value, color, icon: Icon, glow }: any) {
  return (
    <div className={`wr-card wr-card-glow-${glow}`} style={{ position: "relative" }}>
      <Icon size={22} color={color} style={{ position: "absolute", top: 16, left: 16 }} />
      <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Dashboard() {
  const { selectedCompanyId, profile } = useAuth();
  const companyId = selectedCompanyId ?? profile?.company_id ?? null;
  const today = todayISO();
  const now = new Date();

  const { data: employees = [] } = useQuery({
    queryKey: ["company-employees", companyId],
    enabled: !!companyId,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("company_id", companyId!)).data ?? [],
  });
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ["today-att", today, companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const ids = employees.map((e) => e.id);
      if (!ids.length) return [];
      return (await supabase.from("attendance").select("*").in("user_id", ids).eq("date", today)).data ?? [];
    },
  });

  const activeNow = todayAttendance.filter((a) => a.check_in && !a.check_out).length;
  const totalHours = todayAttendance.reduce((s, a) => {
    if (a.check_in && a.check_out) return s + (new Date(a.check_out).getTime() - new Date(a.check_in).getTime()) / 3600000;
    if (a.check_in) return s + (Date.now() - new Date(a.check_in).getTime()) / 3600000;
    return s;
  }, 0);

  // Ranking
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data: monthPoints = [] } = useQuery({
    queryKey: ["month-points", companyId, monthStart],
    enabled: !!employees.length,
    queryFn: async () => (await supabase.from("points").select("user_id, amount").gte("created_at", monthStart).in("user_id", employees.map(e=>e.id))).data ?? [],
  });
  const ranked = employees
    .map((e) => ({ ...e, points: monthPoints.filter((p) => p.user_id === e.id).reduce((s, p) => s + (p.amount ?? 0), 0) }))
    .sort((a, b) => b.points - a.points);
  const maxP = Math.max(1, ...ranked.map((r) => r.points));

  const rankBg = (i: number) => i === 0 ? "rgba(245,158,11,0.04)" : "#080C14";
  const rankBorder = (i: number) => i === 0 ? "1px solid rgba(245,158,11,0.27)" : "1px solid var(--wr-border)";
  const placeIcon = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>דשבורד ראשי</h2>
      <p style={{ color: "#64748B", marginTop: 4, fontSize: 13 }}>סקירה כללית – {HEBREW_MONTHS[now.getMonth()]} {now.getFullYear()}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 18 }}>
        <StatCard label="עובדים פעילים עכשיו" value={activeNow} color="#10B981" icon={Users} glow="green" />
        <StatCard label="שעות עבודה היום" value={totalHours.toFixed(1)} color="#2563EB" icon={Clock} glow="blue" />
        <StatCard label="משימות לאישור" value={0} color="#F59E0B" icon={ClipboardCheck} glow="gold" />
        <StatCard label="פרסים שהוענקו" value={0} color="#A855F7" icon={Trophy} glow="purple" />
      </div>

      <div className="wr-card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>עובדים פעילים – דירוג החודש</h3>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(245,158,11,0.18)", color: "#F59E0B", fontWeight: 700, border: "1px solid rgba(245,158,11,0.4)" }}>
            {HEBREW_MONTHS[now.getMonth()]}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ranked.length === 0 && <div style={{ color: "#64748B", padding: 20, textAlign: "center" }}>אין עדיין עובדים</div>}
          {ranked.map((e, i) => {
            const todayA = todayAttendance.find((a) => a.user_id === e.id);
            const dot = todayA?.check_in && !todayA?.check_out ? "wr-status-active" : "wr-status-offline";
            const hours = todayA?.check_in && todayA?.check_out ? ((new Date(todayA.check_out).getTime() - new Date(todayA.check_in).getTime())/3600000).toFixed(1) : todayA?.check_in ? ((Date.now() - new Date(todayA.check_in).getTime())/3600000).toFixed(1) : "—";
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: rankBg(i), border: rankBorder(i), borderRadius: 10 }}>
                <span style={{ width: 28, textAlign: "center", fontWeight: 800, color: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#CD7F32" : "#64748B" }}>{placeIcon(i)}</span>
                <WrAvatar name={e.full_name} size={34} src={e.avatar_url} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{e.full_name}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{e.job_title ?? "—"}</div>
                </div>
                <div style={{ width: 100 }}>
                  <div className="wr-progress-track"><div className="wr-progress-fill" style={{ width: `${(e.points/maxP)*100}%`, background: "linear-gradient(90deg,#F59E0B,#FCD34D)" }} /></div>
                  <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, marginTop: 4, textAlign: "center" }}>{e.points} נקודות</div>
                </div>
                <div style={{ width: 50, fontSize: 12, color: "#94A3B8", textAlign: "center" }}>{hours} ש׳</div>
                <span className={`wr-status-dot ${dot}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
