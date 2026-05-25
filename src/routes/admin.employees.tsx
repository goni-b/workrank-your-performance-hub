import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { CreateEmployeeModal } from "@/components/employees/CreateEmployeeModal";

export const Route = createFileRoute("/admin/employees")({
  component: () => (
    <RequireAuth roles={["admin","super_admin"]}>
      <EmployeesPage />
    </RequireAuth>
  ),
});

function EmployeesPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const {
    employees, allCount, isLoading,
    searchQuery, setSearchQuery,
    filterRole, setFilterRole,
    filterStatus, setFilterStatus,
    reload,
  } = useEmployees();

  const selectStyle = {
    padding: "10px 12px",
    background: "#111827",
    border: "1px solid #1E2D45",
    borderRadius: 10,
    color: "#F1F5F9",
    fontFamily: "Heebo, sans-serif",
    fontSize: 13,
    cursor: "pointer",
    direction: "rtl" as const,
  };

  return (
    <div className="wr-slide-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>ניהול עובדים</h2>
          <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>
            {allCount} עובדים רשומים במערכת
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: "10px 20px", borderRadius: 10, background: "#2563EB",
            border: "none", color: "#fff", fontFamily: "Heebo, sans-serif",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          + הוסף עובד
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: 14 }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם או תפקיד..."
            style={{
              width: "100%", padding: "10px 38px 10px 12px",
              background: "#111827", border: "1px solid #1E2D45",
              borderRadius: 10, color: "#F1F5F9", fontFamily: "Heebo, sans-serif",
              fontSize: 13, outline: "none", direction: "rtl",
            }}
          />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={selectStyle}>
          <option value="all">כל התפקידים</option>
          <option value="manager">מנהלים</option>
          <option value="employee">עובדים</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="all">כל הסטטוסים</option>
          <option value="active">פעיל</option>
          <option value="frozen">מוקפא</option>
          <option value="inactive">לא פעיל</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ color: "#64748B", textAlign: "center", padding: 40 }}>טוען...</div>
      ) : employees.length === 0 ? (
        <div style={{ color: "#64748B", textAlign: "center", padding: 60, background: "#111827", borderRadius: 14, border: "1px solid #1E2D45" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>לא נמצאו עובדים</div>
          <div style={{ fontSize: 12 }}>נסה לשנות את הסינון או הוסף עובד חדש</div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onClick={() => navigate({ to: "/admin/employees/$id", params: { id: emp.id } })}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEmployeeModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); void reload(); }}
        />
      )}
    </div>
  );
}
