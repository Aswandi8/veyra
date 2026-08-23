import { MailPlus } from "lucide-react";
import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { DataTablePagination } from "@/components/common/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/common/data-table/data-table-provider";
import { DataTableToolbar } from "@/components/common/data-table/data-table-toolbar";
import { InvitationsTable } from "@/components/websites/invitations/invitations-table";

import { Card, CardContent } from "@/components/ui/card";

import { getInvitationsFilters } from "@/lib/invitations/filters";
import { invitationsQuerySchema } from "@/lib/invitations/schema";
import { getServerInvitations } from "@/lib/invitations/server";

import { hasWebsitePermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireWebsitePermission,
} from "@/lib/permissions/guards";

import { getServerWebsite } from "@/lib/websites/server";

interface InvitationsPageProps {
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
  }>;
}

export default async function InvitationsPage({
  params,
  searchParams,
}: InvitationsPageProps) {
  const access = await requireAdminAccess();

  const { id: websiteId } = await params;

  requireWebsitePermission(access, websiteId, PERMISSIONS.member.read);

  const canInvite = hasWebsitePermission(
    access,
    websiteId,
    PERMISSIONS.member.invite,
  );

  const rawQuery = await searchParams;

  const parsed = invitationsQuerySchema.safeParse(rawQuery);

  const query = parsed.success ? parsed.data : invitationsQuerySchema.parse({});

  const [websiteResponse, invitationsResponse] = await Promise.all([
    getServerWebsite(websiteId),

    getServerInvitations(
      websiteId,
      query.q,
      query.page,
      query.limit,
      query.sort,
      query.order,
      query.status,
    ),
  ]);

  if (!websiteResponse.success || !websiteResponse.data) {
    notFound();
  }

  const website = websiteResponse.data;

  const filters = getInvitationsFilters();

  const paginationQuery = {
    q: query.q || undefined,

    sort: query.sort,

    order: query.order,

    status: query.status,
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Invitations"
        subtitle={`Manage invitations for ${website.name}.`}
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
            label: "Invitations",
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
                searchPlaceholder="Search name, email, or role..."
                limit={query.limit}
                filters={filters}
                filterValues={{
                  status: query.status,
                }}
              />

              <InvitationsTable
                websiteId={website.id}
                invitations={invitationsResponse.data}
                limit={query.limit}
                canRevoke={canInvite}
                emptyMessage={
                  query.q
                    ? "No invitations match your search."
                    : "No invitations found."
                }
                currentSort={query.sort}
                currentOrder={query.order}
              />

              <DataTablePagination
                pagination={invitationsResponse.pagination}
                basePath={`/websites/${website.id}/invitations`}
                query={paginationQuery}
                itemLabel="invitations"
              />
            </div>
          </DataTableProvider>
        </CardContent>
      </Card>
    </div>
  );
}
