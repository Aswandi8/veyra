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
import type { RoleListItem } from "@/lib/roles/types";

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
  /* =========================================================
     ACCESS
  ========================================================= */

  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.role.read);

  const canCreate = hasGlobalPermission(access, PERMISSIONS.role.create);

  /* =========================================================
     QUERY
  ========================================================= */

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

  /* =========================================================
     DATA
  ========================================================= */

  const response = await getServerRoles();

  let roles = response.data ?? [];

  /* =========================================================
     SEARCH
  ========================================================= */

  if (query.q) {
    const search = query.q.toLowerCase();

    roles = roles.filter((role) => {
      return (
        role.name.toLowerCase().includes(search) ||
        role.description?.toLowerCase().includes(search)
      );
    });
  }

  /* =========================================================
     FILTERS
  ========================================================= */

  if (query.scope) {
    roles = roles.filter((role) => role.scope === query.scope);
  }

  if (query.type) {
    roles = roles.filter((role) =>
      query.type === "SYSTEM" ? role.system : !role.system,
    );
  }

  /* =========================================================
     SORT
  ========================================================= */

  roles = [...roles].sort((a, b) => {
    let comparison = 0;

    switch (query.sort) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;

      case "scope":
        comparison = a.scope.localeCompare(b.scope);
        break;

      case "type":
        comparison = Number(a.system) - Number(b.system);
        break;

      case "permissions":
        comparison = a.permissionCount - b.permissionCount;
        break;

      case "users":
        comparison = a.userCount - b.userCount;
        break;

      case "updatedAt":
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return query.order === "asc" ? comparison : -comparison;
  });

  /* =========================================================
     PAGINATION
  ========================================================= */

  const total = roles.length;

  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  const page = Math.min(query.page, totalPages);

  const start = (page - 1) * query.limit;

  const paginatedRoles: RoleListItem[] = roles.slice(
    start,
    start + query.limit,
  );

  const pagination = {
    page,
    limit: query.limit,
    total,
    totalPages,
  };

  const filters = getRolesFilters();

  const paginationQuery = {
    q: query.q || undefined,
    sort: query.sort,
    order: query.order,
    scope: query.scope,
    type: query.type,
  };
  /* =========================================================
  RENDER
  ========================================================= */
  const canDelete = hasGlobalPermission(access, PERMISSIONS.role.delete);
  const canUpdate = hasGlobalPermission(access, PERMISSIONS.role.update);
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Roles"
        subtitle="Manage system and website access roles."
        items={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Roles",
          },
        ]}
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
                roles={paginatedRoles}
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
                pagination={pagination}
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
