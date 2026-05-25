import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/manager/rewards")({
  component: () => (
    <RequireAuth roles={["manager"]}>
      <PagePlaceholder title="פרסים" subtitle="יהיה זמין בקרוב" />
    </RequireAuth>
  ),
});
