export const AUTH_ROUTES = {
  login: "/login",

  dashboard: "/dashboard",

  unauthorized: "/unauthorized",

  forbidden: "/forbidden",
} as const;

export const AUTH_CONFIG = {
  idleTimeoutMs: 30 * 60 * 1000,
} as const;
