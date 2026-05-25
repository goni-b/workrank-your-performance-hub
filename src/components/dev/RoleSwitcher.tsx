import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, isDevPreview, type AppRole, type Profile } from "@/lib/auth-context";

type PreviewRole = Exclude<AppRole, "super_admin">;

const ROLES: { id: PreviewRole; label: string; color: string; path: string; prefix: string }[] = [
  { id: "admin",    label: "⚙️ אדמין",       color: "#F59E0B", path: "/admin/dashboard", prefix: "/admin" },
  { id: "manager",  label: "👥 מנהל צוות",   color: "#2563EB", path: "/manager/clock",   prefix: "/manager" },
  { id: "employee", label: "👤 עובד",         color: "#10B981", path: "/employee/clock",  prefix: "/employee" },
];

const makeDevProfile = (role: PreviewRole): Profile => ({
  id: `dev-${role}`,
  full_name: role === "admin" ? "אדמין (תצוגה)" : role === "manager" ? "מנהל (תצוגה)" : "עובד (תצוגה)",
  role,
  company_id: "f2a6a02f-d0d2-4c9c-aebd-2b92b83e657b",
  team_id: null,
  job_title: null,
  avatar_url: null,
  status: "active",
});

export function RoleSwitcher() {
  const { user, setDevProfileOverride } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const dev = isDevPreview();
  const activeRole =
    ROLES.find((r) => pathname.startsWith(r.prefix))?.id ?? null;

  // Sync dev profile override based on path
  useEffect(() => {
    if (!dev || user) return;
    setDevProfileOverride(activeRole ? makeDevProfile(activeRole) : null);
  }, [dev, user, activeRole, setDevProfileOverride]);

  if (!dev) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 9999,
        height: 40,
        background: "linear-gradient(90deg, #0D1321, #111827)",
        borderBottom: "1px solid #1E2D45",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 16px",
        direction: "rtl",
        fontFamily: "Heebo, sans-serif",
        fontSize: 12,
        color: "#F1F5F9",
      }}
    >
      <span style={{ color: "#94A3B8", fontWeight: 600 }}>👁️ תצוגה מקדימה:</span>
      {ROLES.map((r) => {
        const isActive = activeRole === r.id;
        return (
          <Link
            key={r.id}
            to={r.path}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 12,
              textDecoration: "none",
              background: isActive ? r.color : "transparent",
              border: `1px solid ${isActive ? r.color : "#1E2D45"}`,
              color: isActive ? "#0D1321" : r.color,
              transition: "all 0.15s",
            }}
          >
            {r.label}
          </Link>
        );
      })}
      <span style={{ opacity: 0.3 }}>|</span>
      <span style={{ color: "#64748B" }}>
        מצב: <span style={{ color: "#F1F5F9", fontWeight: 700 }}>
          {ROLES.find((r) => r.id === activeRole)?.label ?? "—"}
        </span>
      </span>
      <div style={{ flex: 1 }} />
      <span
        style={{
          padding: "3px 8px",
          borderRadius: 6,
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#EF4444",
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: 0.5,
        }}
      >
        DEV ONLY
      </span>
    </div>
  );
}