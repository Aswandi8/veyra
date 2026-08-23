"use client";

import Link from "next/link";

import { Settings2, ShieldCheck, UserRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AdminAccess } from "@/lib/permissions/types";

interface UserMenuProps {
  user: AdminAccess["user"];
  superAdmin?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function UserMenu({ user, superAdmin = false }: UserMenuProps) {
  const userName = user.name?.trim() || "Veyra User";

  const initials = getInitials(userName);

  const roleLabel = superAdmin ? "Super Admin" : "Administrator";

  return (
    <DropdownMenu>
      {/* ====================================================
          TRIGGER
      ==================================================== */}

      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-10 gap-2 px-2 sm:px-3"
            aria-label="Open user menu"
          />
        }
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="font-sans text-xs font-bold">{initials}</span>
        </div>

        <span className="hidden max-w-40 truncate font-sans text-sm font-semibold text-foreground sm:block">
          {userName}
        </span>
      </DropdownMenuTrigger>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-0">
        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <div className="flex flex-col items-center px-5 pb-5 pt-6 text-center">
          {/* Avatar */}

          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
            {initials ? (
              <span className="font-display text-2xl font-semibold">
                {initials}
              </span>
            ) : (
              <UserRound className="size-8" />
            )}
          </div>

          {/* Name */}

          <p className="mt-4 max-w-full truncate font-sans text-base font-semibold text-foreground">
            {userName}
          </p>

          {/* Email */}

          <p className="mt-1 max-w-full truncate font-sans text-xs text-muted-foreground">
            {user.email}
          </p>

          {/* Role */}

          <div className="mt-3 flex items-center gap-1.5 text-primary">
            <ShieldCheck className="size-3.5" />

            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">
              {roleLabel}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* ==================================================
            ACCOUNT MENU
        ================================================== */}

        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/profile" />}
            className="h-10 gap-3"
          >
            <UserRound className="size-4 text-muted-foreground" />

            <span>My account</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/settings" />}
            className="h-10 gap-3"
          >
            <Settings2 className="size-4 text-muted-foreground" />

            <span>Preferences</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="m-0" />

        {/* ==================================================
            LOGOUT
        ================================================== */}

        <div className="p-3">
          <LogoutButton
            variant="outline"
            className="h-10 w-full justify-center"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
