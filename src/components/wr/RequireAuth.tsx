import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole, isDevPreview } from "@/lib/auth-context";
import { AppLayout } from "./AppLayout";

export function RequireAuth({ roles, children }: { roles?: AppRole[]; children: ReactNode }) {
  const { loading, user, profile } = useAuth();
  const navigate = useNavigate();
  const dev = isDevPreview();
  useEffect(() => {
    if (loading) return;
    // Dev preview: allow viewing pages without real auth (RoleSwitcher injects a fake profile)
    if (dev && !user) return;
    if (!user) navigate({ to: "/login" });
    else if (roles && profile && !roles.includes(profile.role)) navigate({ to: "/unauthorized" });
  }, [loading, user, profile, roles, navigate, dev]);

  // In dev preview, render the layout even without a real user/profile
  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>טוען…</div>;
  }
  if (!user && !dev) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>טוען…</div>;
  }
  if (user && !profile) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>טוען…</div>;
  }
  return <AppLayout>{children}</AppLayout>;
}
