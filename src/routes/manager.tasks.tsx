import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/manager/tasks")({
  component: () => (
    <RequireAuth roles={["manager"]}>
      <PagePlaceholder title="אישור משימות" subtitle="יגיע ב-M5" />
    </RequireAuth>
  ),
});
