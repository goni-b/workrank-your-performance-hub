import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/employee/rewards")({
  component: () => (
    <RequireAuth roles={["employee"]}>
      <PagePlaceholder title="הפרסים שלי" subtitle="יגיע ב-M6" />
    </RequireAuth>
  ),
});
