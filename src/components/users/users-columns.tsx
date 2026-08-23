"use client";

import Link from "next/link";

import { Eye, MoreHorizontal, Pencil } from "lucide-react";

import { StatusBadge } from "@/components/common/status/status-badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableColumn } from "@/lib/data-table/types";
import { formatDateTime } from "@/lib/format/date";
import type { UserListItem } from "@/lib/users/types";

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

interface GetUsersColumnsOptions {
  canUpdate: boolean;
}

export function getUsersColumns({
  canUpdate,
}: GetUsersColumnsOptions): readonly DataTableColumn<UserListItem>[] {
  return [
    {
      id: "user",
      header: "User",
      sortable: true,
      sortKey: "name",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar>
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : null}

            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <Link
              href={`/users/${user.id}`}
              className="block truncate font-medium transition-colors hover:text-primary"
            >
              {user.name}
            </Link>

            <TypographyMuted className="truncate">{user.email}</TypographyMuted>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortKey: "status",
      cell: (user) => (
        <StatusBadge status={user.banned ? "BANNED" : user.status} />
      ),
    },
    {
      id: "roles",
      header: "Roles",
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge key={role.id} variant="outline">
                {role.name.replaceAll("_", " ")}
              </Badge>
            ))
          ) : (
            <TypographyMuted>No role</TypographyMuted>
          )}
        </div>
      ),
    },
    {
      id: "verification",
      header: "Verification",
      cell: (user) => (
        <StatusBadge status={user.emailVerified ? "VERIFIED" : "UNVERIFIED"} />
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      sortable: true,
      sortKey: "createdAt",
      cell: (user) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(user.createdAt)}
        </TypographyMuted>
      ),
    },
    {
      id: "actions",
      header: "",
      headerClassName: "w-12",
      cellClassName: "w-12 text-right",
      cell: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Open actions for ${user.name}`}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem
              nativeButton={false}
              render={<Link href={`/users/${user.id}`} />}
            >
              <Eye className="size-4" />
              View
            </DropdownMenuItem>

            {canUpdate ? (
              <DropdownMenuItem
                nativeButton={false}
                render={<Link href={`/users/${user.id}/edit`} />}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
