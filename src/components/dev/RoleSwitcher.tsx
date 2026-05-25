import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const { user, profile, setDevProfileOverride } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const dev = isDevPreview();
  // Real admins can also preview manager/employee views
  const isAdmin = !!user && (profile?.role === "admin" || profile?.role === "super_admin");
  const show = dev || isAdmin;
  const activeRole =
    ROLES.find((r) => pathname.startsWith(r.prefix))?.id ?? null;

  // Sync dev profile override based on path
  useEffect(() => {
    if (!show) return;
    if (isAdmin) {
      // For real admin: override only when previewing manager/employee paths
      if (activeRole && activeRole !== "admin") {
        setDevProfileOverride(makeDevProfile(activeRole));
      } else {
        setDevProfileOverride(null);
      }
    } else if (!user) {
      // Dev preview without auth
      setDevProfileOverride(activeRole ? makeDevProfile(activeRole) : null);
    }
  }, [show, isAdmin, user, activeRole, setDevProfileOverride]);

  if (!mounted || !show) return null;

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
        gap: 8,
        padding: "0 12px",
        direction: "rtl",
        fontFamily: "Heebo, sans-serif",
        fontSize: 11,
        color: "#F1F5F9",
        overflow: "hidden",
        flexWrap: "nowrap",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "#94A3B8", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>
        {isAdmin ? "👁️ תצוגה כ:" : "👁️ תצוגה מקדימה:"}
      </span>
      {ROLES.map((r) => {
        const isActive = activeRole === r.id;
        return (
          <Link
            key={r.id}
            to={r.path}
            style={{
              padding: "3px 10px",
              borderRadius: 99,
              fontWeight: isActive ? 700 : 500,
              fontSize: 11,
              textDecoration: "none",
              background: isActive ? r.color + "20" : "transparent",
              border: `1px solid ${isActive ? r.color : "#1E2D45"}`,
              color: isActive ? r.color : "#64748B",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {r.label}
          </Link>
        );
      })}
      {!isAdmin && <span
        style={{
          marginRight: "auto",
          padding: "2px 6px",
          borderRadius: 4,
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#EF4444",
          fontWeight: 800,
          fontSize: 9,
          letterSpacing: 0.5,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        DEV
      </span>}
    </div>
  );
}