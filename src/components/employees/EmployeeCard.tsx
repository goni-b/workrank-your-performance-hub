import { WrAvatar } from "@/components/wr/Avatar";
import { useEmployeeMonthPoints, type Employee } from "@/hooks/useEmployees";

const STATUS_CONFIG = {
  active: { label: "פעיל", color: "#10B981" },
  frozen: { label: "מוקפא", color: "#F59E0B" },
  inactive: { label: "לא פעיל", color: "#64748B" },
} as const;

export function EmployeeCard({
  employee,
  onClick,
}: {
  employee: Employee;
  onClick: () => void;
}) {
  const status = STATUS_CONFIG[employee.status] ?? STATUS_CONFIG.active;
  const { data: monthPoints = 0 } = useEmployeeMonthPoints(employee.id);

  return (
    <div
      onClick={onClick}
      style={{
        background: "#111827",
        border: "1px solid #1E2D45",
        borderRadius: 14,
        padding: 20,
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#2563EB44";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#1E2D45";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <WrAvatar name={employee.full_name} src={employee.avatar_url} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {employee.full_name}
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
            {employee.job_title ?? (employee.role === "manager" ? "מנהל צוות" : "עובד")}
          </div>
        </div>
        <span
          style={{
            background: status.color + "18",
            border: `1px solid ${status.color}44`,
            color: status.color,
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 99,
            flexShrink: 0,
          }}
        >
          {status.label}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#64748B",
        }}
      >
        <span>{employee.team_name ? `🏢 ${employee.team_name}` : "לא שויך לצוות"}</span>
        <span>
          {employee.start_date
            ? `הצטרף ${new Date(employee.start_date).toLocaleDateString("he-IL", {
                month: "short",
                year: "numeric",
              })}`
            : ""}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13 }}>⭐</span>
          <span style={{ color: "#FCD34D", fontWeight: 700, fontSize: 13 }}>
            {monthPoints} נקודות
          </span>
          <span style={{ color: "#64748B", fontSize: 11 }}>החודש</span>
        </div>
        <span style={{ color: "#2563EB", fontSize: 12, fontWeight: 600 }}>
          הצג פרופיל ←
        </span>
      </div>
    </div>
  );
}