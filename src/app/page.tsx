import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getAuthAccessError } from "@/lib/auth/access";
import { getServerSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect(AUTH_ROUTES.login);
  }

  const accessError = getAuthAccessError(session);

  if (accessError) {
    redirect(`${AUTH_ROUTES.login}?error=${encodeURIComponent(accessError)}`);
  }

  redirect(AUTH_ROUTES.dashboard);
}
