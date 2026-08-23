import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { RoleForm } from "@/components/roles/role-form";

import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";

import { getServerPermissions, getServerRole } from "@/lib/roles/server";

interface EditRolePageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatRoleName(name: string): string {
  return name.replaceAll("_", " ");
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.role.update);

  const { id } = await params;

  const [roleResponse, permissionsResponse] = await Promise.all([
    getServerRole(id),
    getServerPermissions(),
  ]);

  const role = roleResponse.data;

  if (!role) {
    notFound();
  }

  /*
   * Backend juga melindungi SUPER_ADMIN,
   * tetapi frontend sebaiknya tidak
   * menampilkan halaman editnya sama sekali.
   */
  if (role.name === "SUPER_ADMIN") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Edit Role"
        subtitle={`Update ${formatRoleName(role.name)} role and permissions.`}
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
            label: formatRoleName(role.name),
            href: `/roles/${role.id}`,
          },
          {
            label: "Edit",
          },
        ]}
      />

      <RoleForm
        mode="edit"
        role={role}
        permissions={permissionsResponse.data ?? []}
      />
    </div>
  );
}
