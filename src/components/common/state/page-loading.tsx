import { AppImage } from "@/components/common/app-image";
import { TypographyMuted } from "@/components/ui/typography";

interface PageLoadingProps {
  label?: string;
  fullScreen?: boolean;
}

export function PageLoading({
  label = "Preparing your workspace",
  fullScreen = false,
}: PageLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={
        fullScreen
          ? "fixed inset-0 z-50 grid min-h-dvh w-full place-items-center bg-background text-foreground"
          : "grid min-h-[calc(100dvh-4rem)] w-full place-items-center bg-background text-foreground"
      }
    >
      <div className="flex w-full max-w-sm flex-col items-center px-6 text-center">
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute size-40 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
          />

          <AppImage
            src="/logo.png"
            alt="Veyra"
            width={360}
            height={160}
            priority={fullScreen}
            className="relative h-auto w-52 object-contain sm:w-60"
          />
        </div>

        <div className="mt-7">
          <TypographyMuted className="font-sans text-sm font-medium">
            {label}
          </TypographyMuted>
        </div>

        <TypographyMuted className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
          Create · Stream · Grow
        </TypographyMuted>

        <div className="mt-7 w-52" aria-hidden="true">
          <div className="relative h-1 overflow-hidden rounded-full bg-muted">
            <div className="veyra-loading-bar absolute inset-y-0 left-0 w-16 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
