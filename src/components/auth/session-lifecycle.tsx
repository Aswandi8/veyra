"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AUTH_CONFIG, AUTH_ROUTES } from "@/lib/auth/constants";

interface SessionLifecycleProps {
  expiresAt: string;
}

export function SessionLifecycle({ expiresAt }: SessionLifecycleProps) {
  const router = useRouter();

  useEffect(() => {
    let finished = false;

    let idleTimer: ReturnType<typeof setTimeout>;

    async function endSession(reason: "idle-timeout" | "session-expired") {
      if (finished) {
        return;
      }

      finished = true;

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
      } catch (error) {
        console.error("[SESSION LIFECYCLE LOGOUT]", error);
      }

      router.replace(
        `${AUTH_ROUTES.login}?error=${encodeURIComponent(reason)}`,
      );

      router.refresh();
    }

    function resetIdleTimer() {
      clearTimeout(idleTimer);

      idleTimer = setTimeout(() => {
        void endSession("idle-timeout");
      }, AUTH_CONFIG.idleTimeoutMs);
    }

    const expiryTime = new Date(expiresAt).getTime();

    const expiryDelay = expiryTime - Date.now();

    if (Number.isNaN(expiryTime) || expiryDelay <= 0) {
      void endSession("session-expired");

      return;
    }

    const expiryTimer = setTimeout(() => {
      void endSession("session-expired");
    }, expiryDelay);

    resetIdleTimer();

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
      "scroll",
      "focus",
    ];

    for (const event of activityEvents) {
      window.addEventListener(event, resetIdleTimer, {
        passive: true,
      });
    }

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(expiryTimer);

      for (const event of activityEvents) {
        window.removeEventListener(event, resetIdleTimer);
      }
    };
  }, [expiresAt, router]);

  return null;
}
