import { useEffect, useState } from "react";
import { Bell, Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { WrAvatar } from "./Avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { profile, user } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: pointsThisMonth = 0 } = useQuery({
    queryKey: ["my-points-month", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
      const { data } = await supabase
        .from("points")
        .select("amount")
        .eq("user_id", user!.id)
        .gte("created_at", start.toISOString());
      return (data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
    },
  });

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  const { data: companyName } = useQuery({
    queryKey: ["company-name", profile?.company_id],
    enabled: !!profile?.company_id,
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("name").eq("id", profile!.company_id!).maybeSingle();
      return data?.name ?? "";
    },
  });

  return (
    <header
      style={{
        height: 56,
        background: "var(--wr-bg-surface)",
        borderBottom: "1px solid var(--wr-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 5,
      }}
    >
      {/* Left side - time + date */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: "#F1F5F9",
          fontVariantNumeric: "tabular-nums", direction: "ltr", letterSpacing: 1,
        }}>
          {now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
        </span>
        <span style={{ color: "#1E2D45", fontSize: 14 }}>|</span>
        <span className="header-date" style={{ fontSize: 12, color: "#64748B" }}>
          {now.toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "long" })}
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {!isAdmin && profile && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.33)",
              padding: "5px 14px", borderRadius: 99,
              fontSize: 12,
            }}
          >
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <span style={{ color: "#F59E0B", fontWeight: 800 }}>{pointsThisMonth}</span>
            <span style={{ color: "#94A3B8" }}>נקודות החודש</span>
          </div>
        )}

        {profile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <WrAvatar name={profile.full_name} size={32} src={profile.avatar_url} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{profile.full_name}</div>
              {companyName && <div style={{ fontSize: 10, color: "#64748B" }}>{companyName}</div>}
            </div>
          </div>
        )}

        <button
          aria-label="התראות"
          style={{
            position: "relative",
            background: "transparent", border: "1px solid var(--wr-border)",
            borderRadius: 8, padding: 6, color: "#94A3B8", cursor: "pointer",
          }}
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
