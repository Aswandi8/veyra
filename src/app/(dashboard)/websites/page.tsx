import { Plus } from "lucide-react";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { DataTablePagination } from "@/components/common/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/common/data-table/data-table-provider";
import { DataTableToolbar } from "@/components/common/data-table/data-table-toolbar";
import { WebsitesTable } from "@/components/websites/websites-table";

import { Card, CardContent } from "@/components/ui/card";

import { hasGlobalPermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getWebsitesFilters } from "@/lib/websites/filters";
import { websitesQuerySchema } from "@/lib/websites/schema";
import { getServerWebsites } from "@/lib/websites/server";

interface WebsitesPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: string;
    status?: string;
  }>;
}

export default async function WebsitesPage({
  searchParams,
}: WebsitesPageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.website.read);

  const canCreate = hasGlobalPermission(access, PERMISSIONS.website.create);

  const canUpdate = hasGlobalPermission(access, PERMISSIONS.website.update);

  const canDelete = hasGlobalPermission(access, PERMISSIONS.website.delete);

  const params = await searchParams;

  const parsed = websitesQuerySchema.safeParse({
    q: params.q,
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    order: params.order,
    status: params.status,
  });

  const query = parsed.success
    ? parsed.data
    : websitesQuerySchema.parse({
        q: "",
        page: 1,
        limit: 20,
        sort: "createdAt",
        order: "desc",
      });

  const websites = await getServerWebsites(
    query.q,
    query.page,
    query.limit,
    query.sort,
    query.order,
    query.status,
  );

  const filters = getWebsitesFilters();

  const paginationQuery = {
    q: query.q || undefined,
    sort: query.sort,
    order: query.order,
    status: query.status,
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Websites"
        subtitle="Manage websites connected to Veyra."
        items={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Websites",
          },
        ]}
        action={
          canCreate
            ? {
                label: "Create",
                href: "/websites/new",
                icon: Plus,
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
                searchPlaceholder="Search website, slug, or domain..."
                limit={query.limit}
                filters={filters}
                filterValues={{
                  status: query.status,
                }}
              />

              <WebsitesTable
                websites={websites.data}
                limit={query.limit}
                canUpdate={canUpdate}
                canDelete={canDelete}
                emptyMessage={
                  query.q
                    ? "No websites match your search."
                    : "No websites found."
                }
                currentSort={query.sort}
                currentOrder={query.order}
              />

              <DataTablePagination
                pagination={websites.pagination}
                basePath="/websites"
                query={paginationQuery}
                itemLabel="websites"
              />
            </div>
          </DataTableProvider>
        </CardContent>
      </Card>
    </div>
  );
}
