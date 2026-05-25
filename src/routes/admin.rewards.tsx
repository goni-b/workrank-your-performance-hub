import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/admin/rewards")({
  component: () => (
    <RequireAuth roles={["admin","super_admin"]}>
      <PagePlaceholder title="פרסים" subtitle="ניהול פרסים — יהיה זמין בקרוב" />
    </RequireAuth>
  ),
});
