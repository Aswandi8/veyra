export type AuthUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: string | null;
  status: AuthUserStatus;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSessionData {
  user: AuthUser;
  session: AuthSession;
}
