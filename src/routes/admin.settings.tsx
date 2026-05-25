import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <RequireAuth roles={["admin","super_admin"]}>
      <PagePlaceholder title="הגדרות" subtitle="הגדרות חברה — יגיע ב-M8" />
    </RequireAuth>
  ),
});
