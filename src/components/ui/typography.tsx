import * as React from "react";

import { cn } from "@/lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement>;

export function TypographyH1({ className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH2({ className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        "text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH3({ className, ...props }: TypographyProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH4({ className, ...props }: TypographyProps) {
  return (
    <h4
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function TypographyLead({ className, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-base text-muted-foreground sm:text-lg", className)}
      {...props}
    />
  );
}

export function TypographyP({ className, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-sm leading-6 text-foreground", className)}
      {...props}
    />
  );
}

export function TypographyMuted({ className, ...props }: TypographyProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function TypographySmall({ className, ...props }: TypographyProps) {
  return (
    <small
      className={cn(
        "text-xs font-medium leading-none text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyLabel({ className, ...props }: TypographyProps) {
  return (
    <span
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function TypographyCaption({ className, ...props }: TypographyProps) {
  return (
    <span
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}
