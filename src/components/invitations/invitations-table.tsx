"use client";

import { useMemo } from "react";

import { DataTable } from "@/components/common/data-table/data-table";

import { createInvitationsColumns } from "@/components/invitations/invitations-columns";

import type { WebsiteInvitation } from "@/lib/invitations/types";

interface InvitationsTableProps {
  websiteId: string;

  invitations: WebsiteInvitation[];

  limit: number;

  canRevoke: boolean;

  emptyMessage?: string;
}

export function InvitationsTable({
  websiteId,
  invitations,
  limit,
  canRevoke,
  emptyMessage = "No invitations found.",
}: InvitationsTableProps) {
  const columns = useMemo(
    () =>
      createInvitationsColumns({
        websiteId,
        canRevoke,
      }),
    [websiteId, canRevoke],
  );

  return (
    <DataTable
      data={invitations}
      columns={columns}
      getRowKey={(invitation) => invitation.id}
      emptyMessage={emptyMessage}
      loadingRows={limit}
    />
  );
}
