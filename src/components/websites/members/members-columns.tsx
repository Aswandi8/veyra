"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/common/status/status-badge";
import { MemberActions } from "@/components/websites/members/member-actions";

import { TypographyMuted } from "@/components/ui/typography";

import type { DataTableColumn } from "@/lib/data-table/types";
import { formatDateTime } from "@/lib/format/date";
import type { MemberListItem } from "@/lib/members/types";

interface CreateMembersColumnsOptions {
  websiteId: string;
  canUpdate: boolean;
  canRemove: boolean;
}

export function createMembersColumns({
  websiteId,
  canUpdate,
  canRemove,
}: CreateMembersColumnsOptions): readonly DataTableColumn<MemberListItem>[] {
  return [
    {
      id: "member",
      header: "Member",
      sortable: true,
      sortKey: "name",

      cell: (member) => (
        <div className="min-w-52">
          <Link
            href={`/users/${member.userId}`}
            className="font-medium transition-colors hover:text-primary"
          >
            {member.name}
          </Link>

          <TypographyMuted className="mt-1">{member.email}</TypographyMuted>
        </div>
      ),
    },

    {
      id: "role",
      header: "Role",
      sortable: true,
      sortKey: "role",

      cell: (member) => <StatusBadge status={member.role.name} />,
    },

    {
      id: "status",
      header: "Status",
      sortable: true,
      sortKey: "status",

      cell: (member) => <StatusBadge status={member.status} />,
    },

    {
      id: "verification",
      header: "Verification",

      cell: (member) => (
        <StatusBadge
          status={member.emailVerified ? "VERIFIED" : "UNVERIFIED"}
        />
      ),
    },

    {
      id: "createdAt",
      header: "Joined",
      sortable: true,
      sortKey: "createdAt",

      cell: (member) => (
        <TypographyMuted className="whitespace-nowrap">
          {formatDateTime(member.createdAt)}
        </TypographyMuted>
      ),
    },

    {
      id: "actions",

      header: <span className="sr-only">Actions</span>,

      headerClassName: "w-12 text-right",

      cellClassName: "w-12 text-right",

      cell: (member) => (
        <MemberActions
          websiteId={websiteId}
          member={member}
          canUpdate={canUpdate}
          canRemove={canRemove}
        />
      ),
    },
  ];
}
