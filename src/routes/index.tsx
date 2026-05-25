import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { loading, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!profile) return;
    switch (profile.role) {
      case "super_admin": navigate({ to: "/select-company" }); break;
      case "admin":       navigate({ to: "/admin/dashboard" }); break;
      case "manager":     navigate({ to: "/manager/clock" }); break;
      case "employee":    navigate({ to: "/employee/clock" }); break;
    }
  }, [loading, user, profile, navigate]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
      טוען…
    </div>
  );
}
