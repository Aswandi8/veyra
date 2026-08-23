"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";

import { usePathname, useRouter } from "next/navigation";

import {
  createDataTableHref,
  type DataTableQueryRecord,
} from "@/lib/data-table/query";

interface DataTableNavigationContextValue {
  isPending: boolean;

  navigate: (href: string) => void;

  refresh: () => void;

  updateQuery: (updates: DataTableQueryRecord) => void;
}

const DataTableNavigationContext =
  createContext<DataTableNavigationContextValue | null>(null);

interface DataTableProviderProps {
  children: ReactNode;
}

export function DataTableProvider({ children }: DataTableProviderProps) {
  const router = useRouter();

  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();

  /* =========================================================
     NAVIGATE
     ========================================================= */

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.replace(href, {
          scroll: false,
        });
      });
    },
    [router],
  );

  /* =========================================================
     REFRESH
     ========================================================= */

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  /* =========================================================
     UPDATE QUERY
     ========================================================= */

  const updateQuery = useCallback(
    (updates: DataTableQueryRecord) => {
      const currentParams = Object.fromEntries(
        new URLSearchParams(window.location.search),
      );

      const href = createDataTableHref(pathname, currentParams, updates);

      navigate(href);
    },
    [navigate, pathname],
  );

  /* =========================================================
     CONTEXT
     ========================================================= */

  const value = useMemo(
    () => ({
      isPending,
      navigate,
      refresh,
      updateQuery,
    }),
    [isPending, navigate, refresh, updateQuery],
  );

  return (
    <DataTableNavigationContext.Provider value={value}>
      {children}
    </DataTableNavigationContext.Provider>
  );
}

/* ===========================================================
   HOOK
   =========================================================== */

export function useDataTableNavigation() {
  const context = useContext(DataTableNavigationContext);

  if (!context) {
    throw new Error(
      "useDataTableNavigation must be used inside DataTableProvider",
    );
  }

  return context;
}
