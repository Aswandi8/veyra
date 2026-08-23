import { HttpStatusState } from "@/components/common/state/http-status-state";

export default function UnauthorizedPage() {
  return (
    <HttpStatusState
      status={401}
      title="Authentication required"
      description="Your session has expired or you're not signed in. Sign in to continue using Veyra."
      fullScreen
      showBackButton={false}
      showDashboardButton={false}
      showLoginButton
    />
  );
}
