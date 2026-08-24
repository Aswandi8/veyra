import { Plus } from "lucide-react";
import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { DataTablePagination } from "@/components/common/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/common/data-table/data-table-provider";
import { DataTableToolbar } from "@/components/common/data-table/data-table-toolbar";
import { RolesTable } from "@/components/roles/roles-table";
import { Card, CardContent } from "@/components/ui/card";
import { hasGlobalPermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getRolesFilters } from "@/lib/roles/filters";
import { rolesQuerySchema } from "@/lib/roles/schema";
import { getServerRoles } from "@/lib/roles/server";

interface RolesPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: string;
    scope?: string;
    type?: string;
  }>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.role.read);

  const canCreate = hasGlobalPermission(access, PERMISSIONS.role.create);
  const canUpdate = hasGlobalPermission(access, PERMISSIONS.role.update);
  const canDelete = hasGlobalPermission(access, PERMISSIONS.role.delete);

  const params = await searchParams;

  const parsed = rolesQuerySchema.safeParse({
    q: params.q,
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    order: params.order,
    scope: params.scope,
    type: params.type,
  });

  const query = parsed.success
    ? parsed.data
    : rolesQuerySchema.parse({
        q: "",
        page: 1,
        limit: 20,
        sort: "name",
        order: "asc",
      });

  const response = await getServerRoles(
    query.q,
    query.page,
    query.limit,
    query.sort,
    query.order,
    query.scope,
    query.type,
  );

  const filters = getRolesFilters();

  const paginationQuery = {
    q: query.q || undefined,
    sort: query.sort,
    order: query.order,
    scope: query.scope,
    type: query.type,
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Roles"
        subtitle="Manage system and website access roles."
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Roles" }]}
        action={
          canCreate
            ? {
                label: "Create",
                href: "/roles/new",
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
                searchPlaceholder="Search role..."
                limit={query.limit}
                filters={filters}
                filterValues={{
                  scope: query.scope,
                  type: query.type,
                }}
              />

              <RolesTable
                roles={response.data}
                limit={query.limit}
                canUpdate={canUpdate}
                canDelete={canDelete}
                emptyMessage={
                  query.q ? "No roles match your search." : "No roles found."
                }
                currentSort={query.sort}
                currentOrder={query.order}
              />

              <DataTablePagination
                pagination={response.pagination}
                basePath="/roles"
                query={paginationQuery}
                itemLabel="roles"
              />
            </div>
          </DataTableProvider>
        </CardContent>
      </Card>
    </div>
  );
}
