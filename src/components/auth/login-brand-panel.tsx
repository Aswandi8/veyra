import { BarChart3, Layers3, ShieldCheck } from "lucide-react";

import { AppImage } from "@/components/common/app-image";
import { ThemeToggle } from "@/components/common/theme-toggle";

import { TypographyMuted } from "@/components/ui/typography";

const FEATURES = [
  {
    icon: Layers3,
    title: "Centralized workspace",
    description:
      "Manage websites, users, content, and publishing from one place.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Role-based access keeps every workspace and resource protected.",
  },
  {
    icon: BarChart3,
    title: "Built for growth",
    description:
      "Monitor content and performance as your digital ecosystem expands.",
  },
] as const;

export function LoginBrandPanel() {
  return (
    <section className="relative hidden h-dvh min-h-0 overflow-hidden border-r border-border bg-muted/20 lg:flex lg:flex-col">
      {/* Background decoration */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.24)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.24)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]"
      />

      {/* Top bar */}

      <div className="relative z-10 flex shrink-0 items-center justify-between px-8 pt-7 xl:px-10 2xl:px-14 [@media(max-height:720px)]:pt-5">
        <ThemeToggle />

        <TypographyMuted className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-60">
          Veyra Workspace
        </TypographyMuted>
      </div>

      {/* Main content */}

      <div className="relative z-10 flex min-h-0 flex-1 items-center">
        <div className="w-full px-8 xl:px-10 2xl:px-14">
          <div className="max-w-xl">
            {/* Brand logo */}

            <AppImage
              src="/logo.png"
              alt="Veyra"
              width={520}
              height={220}
              priority
              className="h-auto w-72 object-contain xl:w-80 2xl:w-96 [@media(max-height:720px)]:w-64"
            />

            {/* Description */}

            <TypographyMuted className="mt-8 max-w-lg font-sans text-sm leading-6 xl:mt-9 xl:text-base xl:leading-7 [@media(max-height:720px)]:mt-5 [@media(max-height:720px)]:max-w-md [@media(max-height:720px)]:text-xs [@media(max-height:720px)]:leading-5">
              One workspace to manage your websites, content, users, publishing,
              and analytics with clarity and control.
            </TypographyMuted>

            {/* Features */}

            <div className="mt-9 space-y-5 [@media(max-height:720px)]:mt-5 [@media(max-height:720px)]:space-y-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 [@media(max-height:720px)]:gap-3"
                >
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 [@media(max-height:720px)]:size-8">
                    <Icon className="size-4 text-primary" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="font-sans text-sm font-semibold text-foreground [@media(max-height:720px)]:text-xs">
                      {title}
                    </p>

                    <TypographyMuted className="max-w-md text-xs leading-5 [@media(max-height:720px)]:hidden">
                      {description}
                    </TypographyMuted>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}

      <div className="relative z-10 shrink-0 px-8 pb-7 xl:px-10 2xl:px-14 [@media(max-height:720px)]:pb-5">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary" />

          <TypographyMuted className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-60">
            Create · Stream · Grow
          </TypographyMuted>
        </div>
      </div>
    </section>
  );
}
