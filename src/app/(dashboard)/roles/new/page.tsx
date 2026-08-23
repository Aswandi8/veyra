import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { RoleForm } from "@/components/roles/role-form";

import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getServerPermissions } from "@/lib/roles/server";

export default async function NewRolePage() {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.role.create);

  const permissionsResponse = await getServerPermissions();

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Create Role"
        subtitle="Create a custom website role and configure its permissions."
        items={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Roles",
            href: "/roles",
          },
          {
            label: "Create",
          },
        ]}
      />

      <RoleForm mode="create" permissions={permissionsResponse.data ?? []} />
    </div>
  );
}
