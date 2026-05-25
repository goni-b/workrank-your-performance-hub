import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/employee/tasks")({
  component: () => (
    <RequireAuth roles={["employee"]}>
      <PagePlaceholder title="המשימות שלי" subtitle="יגיע ב-M5" />
    </RequireAuth>
  ),
});
