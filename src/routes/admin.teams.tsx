import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/admin/teams")({
  component: () => (
    <RequireAuth roles={["admin","super_admin"]}>
      <PagePlaceholder title="צוותים" subtitle="ניהול צוותים — יגיע ב-M4" />
    </RequireAuth>
  ),
});
