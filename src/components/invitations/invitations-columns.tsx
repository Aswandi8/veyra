"use client";

import { MoreHorizontal } from "lucide-react";

import { RevokeInvitationDialog } from "@/components/invitations/revoke-invitation-dialog";

import { StatusBadge } from "@/components/common/status/status-badge";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableColumn } from "@/lib/data-table/types";

import { formatDateTime } from "@/lib/format/date";

import type { WebsiteInvitation } from "@/lib/invitations/types";

interface CreateInvitationsColumnsOptions {
  websiteId: string;

  canRevoke: boolean;
}

export function createInvitationsColumns({
  websiteId,
  canRevoke,
}: CreateInvitationsColumnsOptions): readonly DataTableColumn<WebsiteInvitation>[] {
  const columns: DataTableColumn<WebsiteInvitation>[] = [
    {
      id: "invitee",
      header: "Invitee",

      cell: (invitation) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{invitation.name}</div>

          <TypographyMuted className="truncate">
            {invitation.email}
          </TypographyMuted>
        </div>
      ),
    },

    {
      id: "role",
      header: "Role",

      cell: (invitation) => (
        <Badge variant="outline">
          {invitation.role.name.replaceAll("_", " ")}
        </Badge>
      ),
    },

    {
      id: "status",
      header: "Status",

      cell: (invitation) => <StatusBadge status={invitation.status} />,
    },

    {
      id: "invitedBy",
      header: "Invited by",

      cell: (invitation) =>
        invitation.invitedBy ? (
          <div className="min-w-0">
            <div className="truncate">{invitation.invitedBy.name}</div>

            <TypographyMuted className="truncate">
              {invitation.invitedBy.email}
            </TypographyMuted>
          </div>
        ) : (
          <TypographyMuted>—</TypographyMuted>
        ),
    },

    {
      id: "expiresAt",
      header: "Expires",

      cell: (invitation) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(invitation.expiresAt)}
        </TypographyMuted>
      ),
    },

    {
      id: "createdAt",
      header: "Created",

      cell: (invitation) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(invitation.createdAt)}
        </TypographyMuted>
      ),
    },
  ];

  if (canRevoke) {
    columns.push({
      id: "actions",

      header: <span className="sr-only">Actions</span>,

      headerClassName: "w-12 text-right",

      cellClassName: "w-12 text-right",

      cell: (invitation) => {
        if (invitation.status !== "PENDING") {
          return null;
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${invitation.email}`}
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-48">
              <RevokeInvitationDialog
                websiteId={websiteId}
                invitation={invitation}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
}
