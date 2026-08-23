import type { AuthSessionData } from "@/lib/auth/types";

export type AuthAccessError =
  | "account-inactive"
  | "account-suspended"
  | "account-banned"
  | "email-not-verified"
  | "session-expired";

export function getAuthAccessError(
  data: AuthSessionData,
): AuthAccessError | null {
  const { user, session } = data;

  const expiresAt = new Date(session.expiresAt);

  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    return "session-expired";
  }

  if (user.banned || user.status === "BANNED") {
    return "account-banned";
  }

  if (user.status === "SUSPENDED") {
    return "account-suspended";
  }

  if (user.status === "INACTIVE") {
    return "account-inactive";
  }

  if (!user.emailVerified) {
    return "email-not-verified";
  }

  if (user.status !== "ACTIVE") {
    return "account-inactive";
  }

  return null;
}
