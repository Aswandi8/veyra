"use client";

import { StatusBadge } from "@/components/common/status/status-badge";
import { InvitationActions } from "@/components/websites/invitations/invitation-actions";

import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableColumn } from "@/lib/data-table/types";
import { formatDateTime } from "@/lib/format/date";
import type { InvitationListItem } from "@/lib/invitations/types";

interface Options {
  websiteId: string;
  canRevoke: boolean;
}

export function createInvitationsColumns({
  websiteId,
  canRevoke,
}: Options): readonly DataTableColumn<InvitationListItem>[] {
  return [
    {
      id: "invitee",
      header: "Invitee",
      sortable: true,
      sortKey: "name",

      cell: (invitation) => (
        <div className="min-w-52">
          <div className="font-medium">{invitation.name}</div>

          <TypographyMuted className="mt-1">{invitation.email}</TypographyMuted>
        </div>
      ),
    },

    {
      id: "role",
      header: "Role",
      sortable: true,
      sortKey: "role",

      cell: (invitation) => <StatusBadge status={invitation.role.name} />,
    },

    {
      id: "status",
      header: "Status",
      sortable: true,
      sortKey: "status",

      cell: (invitation) => <StatusBadge status={invitation.status} />,
    },

    {
      id: "expiresAt",
      header: "Expires",
      sortable: true,
      sortKey: "expiresAt",

      cell: (invitation) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(invitation.expiresAt)}
        </TypographyMuted>
      ),
    },

    {
      id: "createdAt",
      header: "Created",
      sortable: true,
      sortKey: "createdAt",

      cell: (invitation) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(invitation.createdAt)}
        </TypographyMuted>
      ),
    },

    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,

      headerClassName: "w-12 text-right",

      cellClassName: "w-12 text-right",

      cell: (invitation) => (
        <InvitationActions
          websiteId={websiteId}
          invitation={invitation}
          canRevoke={canRevoke}
        />
      ),
    },
  ];
}
