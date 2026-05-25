import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/manager/team")({
  component: () => (
    <RequireAuth roles={["manager"]}>
      <PagePlaceholder title="הצוות שלי" subtitle="יהיה זמין בקרוב" />
    </RequireAuth>
  ),
});
