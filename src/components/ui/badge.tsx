import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",

        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",

        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",

        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",

        brand1:
          "border-transparent bg-[var(--brand-900)] text-black dark:bg-[var(--brand-200)] dark:text-black",

        brand2:
          "border-transparent bg-[var(--brand-800)] text-black dark:bg-[var(--brand-300)] dark:text-black",

        brand3:
          "border-transparent bg-[var(--brand-700)] text-black dark:bg-[var(--brand-400)] dark:text-black",

        brand4:
          "border-transparent bg-[var(--brand-600)] text-black dark:bg-[var(--brand-500)] dark:text-black",

        brand5:
          "border-transparent bg-[var(--brand-500)] text-black dark:bg-[var(--brand-600)] dark:text-black",

        brand6:
          "border-transparent bg-[var(--brand-400)] text-black dark:bg-[var(--brand-700)] dark:text-black",

        brand7:
          "border-transparent bg-[var(--brand-300)] text-black dark:bg-[var(--brand-800)] dark:text-black",

        brand8:
          "border-transparent bg-[var(--brand-200)] text-black dark:bg-[var(--brand-900)] dark:text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(
        badgeVariants({
          variant,
        }),
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
