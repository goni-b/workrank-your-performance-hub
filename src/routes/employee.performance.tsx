import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { PagePlaceholder } from "@/components/wr/PagePlaceholder";

export const Route = createFileRoute("/employee/performance")({
  component: () => (
    <RequireAuth roles={["employee"]}>
      <PagePlaceholder title="הביצועים שלי" subtitle="יהיה זמין בקרוב" />
    </RequireAuth>
  ),
});
