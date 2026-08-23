import { MailPlus } from "lucide-react";
import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { DataTablePagination } from "@/components/common/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/common/data-table/data-table-provider";
import { DataTableToolbar } from "@/components/common/data-table/data-table-toolbar";
import { MembersTable } from "@/components/websites/members/members-table";

import { Card, CardContent } from "@/components/ui/card";

import { getMembersFilters } from "@/lib/members/filters";
import { membersQuerySchema } from "@/lib/members/schema";
import { getServerMembers } from "@/lib/members/server";

import { hasWebsitePermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireWebsitePermission,
} from "@/lib/permissions/guards";

import { getServerWebsite } from "@/lib/websites/server";

interface WebsiteMembersPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: string;
    status?: string;
    verified?: string;
  }>;
}

export default async function WebsiteMembersPage({
  params,
  searchParams,
}: WebsiteMembersPageProps) {
  const access = await requireAdminAccess();

  const { id: websiteId } = await params;

  requireWebsitePermission(access, websiteId, PERMISSIONS.member.read);

  const canInvite = hasWebsitePermission(
    access,
    websiteId,
    PERMISSIONS.member.invite,
  );

  const canUpdate = hasWebsitePermission(
    access,
    websiteId,
    PERMISSIONS.member.update,
  );

  const canRemove = hasWebsitePermission(
    access,
    websiteId,
    PERMISSIONS.member.remove,
  );

  const paramsQuery = await searchParams;

  const parsed = membersQuerySchema.safeParse({
    q: paramsQuery.q,
    page: paramsQuery.page,
    limit: paramsQuery.limit,
    sort: paramsQuery.sort,
    order: paramsQuery.order,
    status: paramsQuery.status,
    verified: paramsQuery.verified,
  });

  const query = parsed.success
    ? parsed.data
    : membersQuerySchema.parse({
        q: "",
        page: 1,
        limit: 20,
        sort: "name",
        order: "asc",
      });

  const [websiteResponse, membersResponse] = await Promise.all([
    getServerWebsite(websiteId),

    getServerMembers(
      websiteId,
      query.q,
      query.page,
      query.limit,
      query.sort,
      query.order,
      query.status,
      query.verified,
    ),
  ]);

  if (!websiteResponse.success || !websiteResponse.data) {
    notFound();
  }

  const website = websiteResponse.data;

  const filters = getMembersFilters();

  const paginationQuery = {
    q: query.q || undefined,
    sort: query.sort,
    order: query.order,
    status: query.status,
    verified: query.verified,
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Members"
        subtitle={`Manage members assigned to ${website.name}.`}
        items={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Websites",
            href: "/websites",
          },
          {
            label: website.name,
            href: `/websites/${website.id}`,
          },
          {
            label: "Members",
          },
        ]}
        action={
          canInvite
            ? {
                label: "Invite",
                href: `/websites/${website.id}/invitations/new`,
                icon: MailPlus,
              }
            : undefined
        }
      />

      <Card className="shadow-none">
        <CardContent>
          <DataTableProvider>
            <div className="space-y-6">
              <DataTableToolbar
                searchValue={query.q}
                searchPlaceholder="Search member, email, or role..."
                limit={query.limit}
                filters={filters}
                filterValues={{
                  status: query.status,
                  verified: query.verified,
                }}
              />

              <MembersTable
                websiteId={website.id}
                members={membersResponse.data}
                limit={query.limit}
                canUpdate={canUpdate}
                canRemove={canRemove}
                emptyMessage={
                  query.q
                    ? "No members match your search."
                    : "No members found."
                }
                currentSort={query.sort}
                currentOrder={query.order}
              />

              <DataTablePagination
                pagination={membersResponse.pagination}
                basePath={`/websites/${website.id}/members`}
                query={paginationQuery}
                itemLabel="members"
              />
            </div>
          </DataTableProvider>
        </CardContent>
      </Card>
    </div>
  );
}
