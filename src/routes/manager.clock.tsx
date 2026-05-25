import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import ClockPage from "@/components/clock/ClockPage";

export const Route = createFileRoute("/manager/clock")({
  component: () => (
    <RequireAuth roles={["manager"]}>
      <ClockPage />
    </RequireAuth>
  ),
});