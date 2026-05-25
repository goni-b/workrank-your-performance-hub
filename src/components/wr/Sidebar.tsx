import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { roleColor, roleLabel } from "@/lib/wr-utils";
import {
  LayoutDashboard, Users, Clock, Trophy, FileBarChart, Settings,
  LogOut, ChevronRight, ChevronLeft, Building2, ClipboardCheck, UsersRound,
} from "lucide-react";

interface NavItem { to: string; label: string; icon: React.ComponentType<{ size?: number }>; }

const NAV: Record<string, NavItem[]> = {
  super_admin: [
    { to: "/select-company", label: "בחירת חברה", icon: Building2 },
    { to: "/admin/dashboard", label: "דשבורד", icon: LayoutDashboard },
    { to: "/admin/employees", label: "עובדים", icon: Users },
  ],
  admin: [
    { to: "/admin/dashboard", label: "דשבורד", icon: LayoutDashboard },
    { to: "/admin/employees", label: "עובדים", icon: Users },
    { to: "/admin/teams", label: "צוותים", icon: UsersRound },
    { to: "/admin/rewards", label: "פרסים", icon: Trophy },
    { to: "/admin/reports", label: "דוחות", icon: FileBarChart },
    { to: "/admin/settings", label: "הגדרות", icon: Settings },
  ],
  manager: [
    { to: "/manager/clock", label: "שעון נוכחות", icon: Clock },
    { to: "/manager/team", label: "הצוות שלי", icon: UsersRound },
    { to: "/manager/tasks", label: "אישור משימות", icon: ClipboardCheck },
    { to: "/manager/rewards", label: "פרסים", icon: Trophy },
  ],
  employee: [
    { to: "/employee/clock", label: "שעון נוכחות", icon: Clock },
    { to: "/employee/tasks", label: "המשימות שלי", icon: ClipboardCheck },
    { to: "/employee/rewards", label: "הפרסים שלי", icon: Trophy },
    { to: "/employee/performance", label: "הביצועים שלי", icon: LayoutDashboard },
  ],
};

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("wr_sidebar_collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem("wr_sidebar_collapsed", String(next)); } catch {}
      return next;
    });
  };
  const router = useRouterState();
  const pathname = router.location.pathname;

  const role = profile?.role ?? "employee";
  const items = NAV[role] ?? [];
  const rColor = roleColor(role);

  const width = collapsed ? 60 : 220;

  return (
    <aside
      style={{
        width,
        background: "var(--wr-bg-surface)",
        borderLeft: "1px solid var(--wr-border)",
        transition: "width 0.25s ease",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo header */}
      <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, #2563EB, #F59E0B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0,
          }}
        >W</div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>WorkRank</div>
            <div style={{ fontSize: 10, color: rColor, fontWeight: 600 }}>{roleLabel(role)}</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: active ? rColor + "18" : "transparent",
                borderRight: `3px solid ${active ? rColor : "transparent"}`,
                color: active ? rColor : "#94A3B8",
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              <Icon size={18} />
              {!collapsed && <span>{it.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          onClick={() => signOut()}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            background: "transparent", border: "1px solid var(--wr-border)",
            borderRadius: 8, color: "#94A3B8", cursor: "pointer",
            fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600,
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>התנתק</span>}
        </button>
        <button
          onClick={toggleCollapsed}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "8px",
            background: "transparent", border: "1px solid var(--wr-border)",
            borderRadius: 8, color: "#94A3B8", cursor: "pointer", fontSize: 12,
            fontFamily: "Heebo, sans-serif",
          }}
        >
          {collapsed ? <ChevronLeft size={14} /> : <><ChevronRight size={14} /> סגור</>}
        </button>
      </div>
    </aside>
  );
}
