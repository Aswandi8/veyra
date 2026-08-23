import { HttpStatusState } from "@/components/common/state/http-status-state";

export default function ForbiddenPage() {
  return (
    <HttpStatusState
      status={403}
      title="Access denied"
      description="You don't have permission to view or manage this section."
    />
  );
}
