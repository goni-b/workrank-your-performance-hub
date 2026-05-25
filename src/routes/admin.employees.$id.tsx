import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { WrAvatar } from "@/components/wr/Avatar";
import { useEmployee } from "@/hooks/useEmployees";
import { TabPersonal } from "@/components/employees/EmployeeProfile/TabPersonal";
import { TabAttendance } from "@/components/employees/EmployeeProfile/TabAttendance";
import { TabPoints } from "@/components/employees/EmployeeProfile/TabPoints";
import { updateEmployeeStatus } from "@/lib/employees.functions";

export const Route = createFileRoute("/admin/employees/$id")({
  component: () => (
    <RequireAuth roles={["admin", "super_admin"]}>
      <EmployeeProfilePage />
    </RequireAuth>
  ),
});

type TabId = "personal" | "attendance" | "points";

function EmployeeProfilePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const updateStatus = useServerFn(updateEmployeeStatus);
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const { data: employee, isLoading } = useEmployee(id);

  const TABS: { id: TabId; label: string }[] = [
    { id: "personal", label: "פרטים אישיים" },
    { id: "attendance", label: "נוכחות" },
    { id: "points", label: "נקודות" },
  ];

  if (isLoading) {
    return <div style={{ padding: 24, color: "#64748B" }}>טוען...</div>;
  }
  if (!employee) {
    return <div style={{ padding: 24, color: "#64748B" }}>עובד לא נמצא</div>;
  }

  const onStatusChange = async (status: "active" | "frozen" | "inactive") => {
    try {
      await updateStatus({ data: { id, status } });
      toast.success("הסטטוס עודכן");
      qc.invalidateQueries({ queryKey: ["employee", id] });
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (e: any) {
      toast.error(e?.message ?? "שגיאה");
    }
  };

  return (
    <div className="wr-slide-in">
      <button
        onClick={() => navigate({ to: "/admin/employees" })}
        style={{
          background: "none", border: "none", color: "#64748B",
          fontSize: 13, cursor: "pointer", marginBottom: 16,
          fontFamily: "Heebo, sans-serif",
        }}
      >
        → חזרה לרשימת עובדים
      </button>

      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        marginBottom: 24, padding: 20,
        background: "#111827", borderRadius: 14, border: "1px solid #1E2D45",
      }}>
        <WrAvatar name={employee.full_name} src={employee.avatar_url} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{employee.full_name}</h2>
          <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>
            {employee.job_title ?? "—"} · {employee.team_name ?? "לא שויך לצוות"}
          </p>
        </div>
        <select
          value={employee.status}
          onChange={(e) => onStatusChange(e.target.value as any)}
          style={{
            padding: "6px 12px", background: "#080C14",
            border: "1px solid #1E2D45", borderRadius: 8,
            color: "#F1F5F9", fontFamily: "Heebo, sans-serif", fontSize: 12,
          }}
        >
          <option value="active">פעיל</option>
          <option value="frozen">מוקפא</option>
          <option value="inactive">לא פעיל</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1E2D45", marginBottom: 20 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #2563EB" : "2px solid transparent",
              color: activeTab === tab.id ? "#2563EB" : "#64748B",
              fontFamily: "Heebo, sans-serif",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "personal" && <TabPersonal employee={employee} />}
      {activeTab === "attendance" && <TabAttendance employeeId={id} />}
      {activeTab === "points" && <TabPoints employeeId={id} />}
    </div>
  );
}