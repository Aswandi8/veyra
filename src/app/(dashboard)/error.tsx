"use client";

import { useEffect } from "react";

import { HttpStatusState } from "@/components/common/state/http-status-state";

interface DashboardErrorPageProps {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}

export default function DashboardErrorPage({
  error,
  reset,
}: DashboardErrorPageProps) {
  useEffect(() => {
    console.error("[VEYRA DASHBOARD ERROR]", error);
  }, [error]);

  return (
    <HttpStatusState
      status={500}
      title="Unable to load this page"
      description="Something went wrong while loading this section. Please try again."
      reset={reset}
    />
  );
}
