import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { AppLayout } from "./AppLayout";

export function RequireAuth({ roles, children }: { roles?: AppRole[]; children: ReactNode }) {
  const { loading, user, profile } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (roles && profile && !roles.includes(profile.role)) navigate({ to: "/" });
  }, [loading, user, profile, roles, navigate]);
  if (loading || !user || !profile) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>טוען…</div>;
  }
  return <AppLayout>{children}</AppLayout>;
}
