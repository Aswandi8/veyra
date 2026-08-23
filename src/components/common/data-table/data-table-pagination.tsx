"use client";

import type { MouseEvent } from "react";

import { useDataTableNavigation } from "@/components/common/data-table/data-table-provider";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { TypographyMuted } from "@/components/ui/typography";

import { createDataTableHref } from "@/lib/data-table/query";

import type { PaginationData } from "@/lib/data-table/types";

interface DataTablePaginationProps {
  pagination: PaginationData;

  basePath: string;

  query?: Record<string, string | number | undefined>;

  itemLabel?: string;
}

type PageItem = number | "start" | "end";

function getPages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "end", totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "start", page - 1, page, page + 1, "end", totalPages];
}

export function DataTablePagination({
  pagination,
  basePath,
  query = {},
  itemLabel = "items",
}: DataTablePaginationProps) {
  const { navigate, isPending } = useDataTableNavigation();

  const { page, limit, total, totalPages } = pagination;

  /* =========================================================
     HREF
     ========================================================= */

  function createHref(targetPage: number): string {
    return createDataTableHref(basePath, query, {
      page: targetPage,

      limit,
    });
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function handleNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();

    navigate(href);
  }

  /* =========================================================
     PAGES
     ========================================================= */

  const pages = getPages(page, totalPages);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <TypographyMuted>
        {total} {itemLabel} · Page {page} of {Math.max(totalPages, 1)}
      </TypographyMuted>

      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            {/* Previous */}

            <PaginationItem>
              <PaginationPrevious
                href={createHref(Math.max(1, page - 1))}
                aria-disabled={page <= 1 || isPending}
                className={
                  page <= 1 || isPending
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(event) =>
                  handleNavigation(event, createHref(Math.max(1, page - 1)))
                }
              />
            </PaginationItem>

            {/* Pages */}

            {pages.map((item, index) =>
              typeof item === "number" ? (
                <PaginationItem key={item}>
                  <PaginationLink
                    href={createHref(item)}
                    isActive={item === page}
                    aria-disabled={isPending}
                    className={
                      isPending ? "pointer-events-none opacity-50" : undefined
                    }
                    onClick={(event) =>
                      handleNavigation(event, createHref(item))
                    }
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ) : (
                <PaginationItem key={`${item}-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ),
            )}

            {/* Next */}

            <PaginationItem>
              <PaginationNext
                href={createHref(Math.min(totalPages, page + 1))}
                aria-disabled={page >= totalPages || isPending}
                className={
                  page >= totalPages || isPending
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(event) =>
                  handleNavigation(
                    event,
                    createHref(Math.min(totalPages, page + 1)),
                  )
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
