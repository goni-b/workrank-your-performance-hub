import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/admin/employees")({
  component: () => (
    <RequireAuth roles={["admin","super_admin"]}>
      <PagePlaceholder title="עובדים" subtitle="ניהול עובדים — יהיה זמין בקרוב" />
    </RequireAuth>
  ),
});
