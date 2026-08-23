"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  label?: string;
}

export function BackButton({ label = "Go back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        router.back();
      }}
    >
      <ArrowLeft className="size-4" />

      {label}
    </Button>
  );
}
