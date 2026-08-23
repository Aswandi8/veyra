import type { ComponentType, ReactNode } from "react";

import Link from "next/link";

import { ChevronRight, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { TypographyH1, TypographyMuted } from "@/components/ui/typography";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbAction {
  label: string;
  href: string;

  icon?: ComponentType<{
    className?: string;
  }>;
}

interface PageBreadcrumbProps {
  title: string;

  subtitle?: ReactNode;

  items: BreadcrumbItem[];

  action?: BreadcrumbAction;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function PageBreadcrumb({
  title,
  subtitle,
  items,
  action,
}: PageBreadcrumbProps) {
  const ActionIcon = action?.icon;

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-none">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <CardHeader className="px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-4">
          {/* Title */}

          <div className="min-w-0">
            <CardTitle className="truncate font-display text-lg font-semibold tracking-tight">
              <TypographyH1>{title}</TypographyH1>
            </CardTitle>

            {subtitle ? (
              <div>
                <TypographyMuted> {subtitle}</TypographyMuted>
              </div>
            ) : null}
          </div>

          {/* Action */}

          {action ? (
            <Button
              nativeButton={false}
              render={<Link href={action.href} />}
              className="shrink-0"
            >
              {ActionIcon ? <ActionIcon className="size-4" /> : null}

              {action.label}
            </Button>
          ) : null}
        </div>
      </CardHeader>

      {/* ====================================================
          SEPARATOR
      ==================================================== */}

      <div className="px-5 sm:px-6">
        <Separator />
      </div>

      {/* ====================================================
          BREADCRUMB
      ==================================================== */}

      <CardContent className="px-5 py-3 sm:px-6">
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li
                  key={`${item.label}-${index}`}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  {/* Link */}

                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="flex min-w-0 items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                    >
                      {index === 0 ? (
                        <Home
                          aria-hidden="true"
                          className="size-3.5 shrink-0"
                        />
                      ) : null}

                      <span className="truncate">{item.label}</span>
                    </Link>
                  ) : (
                    /* Current page */

                    <span
                      aria-current={isLast ? "page" : undefined}
                      className={
                        isLast
                          ? "truncate font-medium text-foreground"
                          : "truncate text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Chevron */}

                  {!isLast ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-muted-foreground/40"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>
      </CardContent>
    </Card>
  );
}
