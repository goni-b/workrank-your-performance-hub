import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/wr/RequireAuth";
import { ClockSkeleton } from "@/components/wr/ClockSkeleton";

export const Route = createFileRoute("/manager/clock")({
  component: () => (
    <RequireAuth roles={["manager"]}>
      <ClockSkeleton />
    </RequireAuth>
  ),
});