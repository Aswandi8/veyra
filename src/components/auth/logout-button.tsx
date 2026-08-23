"use client";

import { LogOut, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";

import * as React from "react";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive";

  className?: string;
}

export function LogoutButton({
  variant = "outline",
  className,
}: LogoutButtonProps) {
  const router = useRouter();

  const [isPending, setIsPending] = React.useState(false);

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",

        credentials: "include",

        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      router.replace("/login");

      router.refresh();
    } catch (error) {
      console.error("[VEYRA LOGOUT]", error);

      toast.error("Tidak dapat keluar dari akun.");

      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      disabled={isPending}
      onClick={handleLogout}
      className={cn(
        "group text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4 transition-colors group-hover:text-destructive" />
      )}

      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
