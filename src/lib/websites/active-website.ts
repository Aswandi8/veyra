import type { WebsiteListItem } from "@/lib/websites/types";

export const ACTIVE_WEBSITE_COOKIE_NAME = "veyra_active_website";

export const ACTIVE_WEBSITE_CHANGED_EVENT = "veyra:active-website-change";

const ACTIVE_WEBSITE_MAX_AGE = 60 * 60 * 24 * 365;

/* ============================================================
   DOCUMENT
   ============================================================ */

function canUseDocument(): boolean {
  return typeof document !== "undefined";
}

/* ============================================================
   READ
   ============================================================ */

export function getStoredActiveWebsiteId(): string | null {
  if (!canUseDocument()) {
    return null;
  }

  const prefix = `${ACTIVE_WEBSITE_COOKIE_NAME}=`;

  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(prefix.length);

  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/* ============================================================
   SET
   ============================================================ */

export function setStoredActiveWebsiteId(websiteId: string): void {
  if (!canUseDocument()) {
    return;
  }

  const normalized = websiteId.trim();

  if (!normalized) {
    return;
  }

  document.cookie = [
    `${ACTIVE_WEBSITE_COOKIE_NAME}=${encodeURIComponent(normalized)}`,

    "Path=/",

    `Max-Age=${ACTIVE_WEBSITE_MAX_AGE}`,

    "SameSite=Lax",
  ].join("; ");

  window.dispatchEvent(
    new CustomEvent(ACTIVE_WEBSITE_CHANGED_EVENT, {
      detail: {
        websiteId: normalized,
      },
    }),
  );
}

/* ============================================================
   CLEAR
   ============================================================ */

export function clearStoredActiveWebsiteId(): void {
  if (!canUseDocument()) {
    return;
  }

  document.cookie = [
    `${ACTIVE_WEBSITE_COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
  ].join("; ");

  window.dispatchEvent(
    new CustomEvent(ACTIVE_WEBSITE_CHANGED_EVENT, {
      detail: {
        websiteId: null,
      },
    }),
  );
}

/* ============================================================
   FIND
   ============================================================ */

export function findWebsiteById(
  websites: readonly WebsiteListItem[],
  websiteId: string | null | undefined,
): WebsiteListItem | null {
  if (!websiteId) {
    return null;
  }

  return websites.find((website) => website.id === websiteId) ?? null;
}

/* ============================================================
   RESOLVE ACTIVE WEBSITE
   ============================================================ */

export function resolveActiveWebsite(
  websites: readonly WebsiteListItem[],
  preferredWebsiteId?: string | null,
): WebsiteListItem | null {
  if (websites.length === 0) {
    return null;
  }

  const preferred = findWebsiteById(websites, preferredWebsiteId);

  if (preferred) {
    return preferred;
  }

  /*
   * Utamakan website ACTIVE.
   */
  const activeWebsite = websites.find((website) => website.status === "ACTIVE");

  return activeWebsite ?? websites[0] ?? null;
}

/* ============================================================
   SUBSCRIBE
   ============================================================ */

export function subscribeActiveWebsiteChange(
  callback: (websiteId: string | null) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleEvent(event: Event) {
    const customEvent = event as CustomEvent<{
      websiteId: string | null;
    }>;

    callback(customEvent.detail?.websiteId ?? null);
  }

  window.addEventListener(ACTIVE_WEBSITE_CHANGED_EVENT, handleEvent);

  return () => {
    window.removeEventListener(ACTIVE_WEBSITE_CHANGED_EVENT, handleEvent);
  };
}
