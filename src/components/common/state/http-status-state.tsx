import Link from "next/link";

import { Home, LogIn, RefreshCcw } from "lucide-react";

import { AppImage } from "@/components/common/app-image";

import { BackButton } from "@/components/common/state/back-button";

import { Button } from "@/components/ui/button";

import { TypographyMuted } from "@/components/ui/typography";

type HttpStatusCode = 401 | 403 | 404 | 500;

interface HttpStatusStateProps {
  status: HttpStatusCode;

  title: string;

  description: string;

  fullScreen?: boolean;

  reset?: () => void;

  showBackButton?: boolean;

  showDashboardButton?: boolean;

  showLoginButton?: boolean;
}

const STATUS_IMAGE: Record<HttpStatusCode, string> = {
  401: "/401.png",
  403: "/403.png",
  404: "/404.png",
  500: "/500.png",
};

export function HttpStatusState({
  status,
  title,
  description,
  fullScreen = false,
  reset,
  showBackButton = true,
  showDashboardButton = true,
  showLoginButton = false,
}: HttpStatusStateProps) {
  return (
    <div
      role={status === 500 ? "alert" : undefined}
      className={
        fullScreen
          ? "fixed inset-0 z-50 grid min-h-dvh w-full place-items-center bg-background px-6 text-foreground"
          : "grid min-h-[calc(100dvh-8rem)] w-full place-items-center text-foreground"
      }
    >
      <div className="flex w-full max-w-xl flex-col items-center px-6 text-center">
        {/* ====================================================
            IMAGE
        ==================================================== */}

        <div className="relative flex items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute size-52 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
          />

          <AppImage
            src={STATUS_IMAGE[status]}
            alt={`${status} ${title}`}
            width={420}
            height={320}
            priority={fullScreen}
            className="relative h-auto max-h-64 w-auto max-w-[85vw] object-contain sm:max-h-72"
          />
        </div>

        {/* ====================================================
            STATUS
        ==================================================== */}

        <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.32em] text-primary">
          Error {status}
        </p>

        {/* ====================================================
            TITLE
        ==================================================== */}

        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <TypographyMuted className="mx-auto mt-4 max-w-md font-sans text-sm leading-6 sm:text-base">
          {description}
        </TypographyMuted>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {showBackButton && <BackButton />}

          {reset && (
            <Button type="button" onClick={reset}>
              <RefreshCcw className="size-4" />
              Try again
            </Button>
          )}

          {showLoginButton && (
            <Button nativeButton={false} render={<Link href="/login" />}>
              <LogIn className="size-4" />
              Sign in
            </Button>
          )}

          {showDashboardButton && (
            <Button
              nativeButton={false}
              variant={reset ? "outline" : "default"}
              render={<Link href="/dashboard" />}
            >
              <Home className="size-4" />
              Dashboard
            </Button>
          )}
        </div>

        {/* ====================================================
            BRAND
        ==================================================== */}

        <TypographyMuted className="mt-10 font-mono text-[10px] uppercase tracking-[0.28em] opacity-50">
          Veyra · Create · Stream · Grow
        </TypographyMuted>
      </div>
    </div>
  );
}
