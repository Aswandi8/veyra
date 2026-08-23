import { DataTableExport } from "@/components/common/data-table/data-table-export";
import { DataTablePagination } from "@/components/common/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/common/data-table/data-table-provider";
import { DataTableToolbar } from "@/components/common/data-table/data-table-toolbar";
import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { UsersTable } from "@/components/users/users-table";
import { Card, CardContent } from "@/components/ui/card";

import { hasGlobalPermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getServerRoles } from "@/lib/roles/server";
import { getUsersExportHref } from "@/lib/users/export";
import { getUsersFilters } from "@/lib/users/filters";
import { usersQuerySchema } from "@/lib/users/schema";
import { getServerUsers } from "@/lib/users/server";

interface UsersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: string;
    status?: string;
    verified?: string;
    banned?: string;
    role?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  /* =========================================================
     ACCESS
  ========================================================= */

  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.user.read);

  const canUpdate = hasGlobalPermission(access, PERMISSIONS.user.update);
  const canDelete = hasGlobalPermission(access, PERMISSIONS.user.delete);
  const canReadRoles = hasGlobalPermission(access, PERMISSIONS.role.read);

  /* =========================================================
     QUERY
  ========================================================= */

  const params = await searchParams;

  const parsed = usersQuerySchema.safeParse({
    q: params.q,
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    order: params.order,
    status: params.status,
    verified: params.verified,
    banned: params.banned,
    role: params.role,
  });

  const query = parsed.success
    ? parsed.data
    : usersQuerySchema.parse({
        q: "",
        page: 1,
        limit: 20,
        sort: "createdAt",
        order: "desc",
      });

  /* =========================================================
     DATA
  ========================================================= */

  const [users, rolesResponse] = await Promise.all([
    getServerUsers(
      query.q,
      query.page,
      query.limit,
      query.sort,
      query.order,
      query.status,
      query.verified,
      query.banned,
      query.role,
    ),
    canReadRoles ? getServerRoles() : Promise.resolve(null),
  ]);

  const filters = getUsersFilters(rolesResponse?.data ?? []);
  const exportHref = getUsersExportHref(query);

  const paginationQuery = {
    q: query.q || undefined,
    sort: query.sort,
    order: query.order,
    status: query.status,
    verified: query.verified,
    banned: query.banned,
    role: query.role,
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Users"
        subtitle="Manage users registered in Veyra."
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
      />

      <DataTableProvider>
        <Card className="shadow-none">
          <CardContent className="space-y-6">
            <DataTableToolbar
              searchValue={query.q}
              searchPlaceholder="Search name or email..."
              limit={query.limit}
              filters={filters}
              filterValues={{
                status: query.status,
                verified: query.verified,
                banned: query.banned,
                role: query.role,
              }}
              actions={<DataTableExport href={exportHref} />}
            />

            <UsersTable
              users={users.data}
              limit={query.limit}
              canUpdate={canUpdate}
              canDelete={canDelete}
              emptyMessage={
                query.q ? "No users match your search." : "No users found."
              }
              currentSort={query.sort}
              currentOrder={query.order}
            />

            <DataTablePagination
              pagination={users.pagination}
              basePath="/users"
              query={paginationQuery}
              itemLabel="users"
            />
          </CardContent>
        </Card>
      </DataTableProvider>
    </div>
  );
}
