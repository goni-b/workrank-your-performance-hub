import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/admin/reports")({
  component: () => (
    <RequireAuth roles={["admin","super_admin"]}>
      <PagePlaceholder title="דוחות" subtitle="דוחות וביצועים — יגיע ב-M7" />
    </RequireAuth>
  ),
});
