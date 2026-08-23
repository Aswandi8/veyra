"use client";

import { useEffect } from "react";

import { HttpStatusState } from "@/components/common/state/http-status-state";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[VEYRA ERROR]", error);
  }, [error]);

  return (
    <HttpStatusState
      status={500}
      title="Something went wrong"
      description="Veyra encountered an unexpected error. Please try again."
      fullScreen
      reset={reset}
      showBackButton={false}
      showDashboardButton={false}
    />
  );
}
