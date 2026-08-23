import { redirect } from "next/navigation";

import { AuthErrorToast } from "@/components/auth/auth-error-toast";
import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { LoginForm } from "@/components/auth/login-form";

import { AppImage } from "@/components/common/app-image";
import { ThemeToggle } from "@/components/common/theme-toggle";

import { TypographyMuted } from "@/components/ui/typography";

import { getAuthAccessError } from "@/lib/auth/access";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getServerSession } from "@/lib/auth/session";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}

function getSafeCallbackUrl(value?: string): string {
  if (!value) {
    return AUTH_ROUTES.dashboard;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return AUTH_ROUTES.dashboard;
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  const session = await getServerSession();

  let accountError = params.error;

  if (session) {
    const accessError = getAuthAccessError(session);

    if (!accessError) {
      redirect(callbackUrl);
    }

    accountError = accessError;
  }

  return (
    <>
      <AuthErrorToast error={accountError} />

      <main className="grid h-dvh min-h-0 w-full overflow-hidden bg-background lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-2">
        {/* Desktop brand */}

        <LoginBrandPanel />

        {/* Login panel */}

        <section className="relative flex h-dvh min-h-0 items-center justify-center overflow-hidden bg-background px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          {/* Mobile header */}

          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-5 lg:hidden">
            <ThemeToggle />

            <AppImage
              src="/logo.png"
              alt="Veyra"
              width={180}
              height={80}
              priority
              className="h-auto w-32 object-contain"
            />
          </div>

          {/* Mobile decorative glow */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl lg:hidden"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-primary/10 blur-3xl lg:hidden"
          />

          {/* Form */}

          <div className="relative z-[1] w-full max-w-md pt-14 sm:pt-12 lg:pt-0 [@media(max-height:680px)]:max-w-sm [@media(max-height:680px)]:pt-10 lg:[@media(max-height:680px)]:pt-0">
            <LoginForm callbackUrl={callbackUrl} />

            <TypographyMuted className="mt-7 text-center font-mono text-[9px] uppercase tracking-[0.25em] opacity-50 lg:hidden [@media(max-height:680px)]:mt-4">
              Create · Stream · Grow
            </TypographyMuted>
          </div>
        </section>
      </main>
    </>
  );
}
