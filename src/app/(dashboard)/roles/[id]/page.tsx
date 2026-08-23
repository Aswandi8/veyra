import { Pencil } from "lucide-react";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { StatusBadge } from "@/components/common/status/status-badge";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TypographyH3,
  TypographyMuted,
  TypographyP,
} from "@/components/ui/typography";

import { hasGlobalPermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getServerRole } from "@/lib/roles/server";

interface RoleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatRoleName(name: string): string {
  return name.replaceAll("_", " ");
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.role.read);

  const canUpdate = hasGlobalPermission(access, PERMISSIONS.role.update);

  const { id } = await params;

  const response = await getServerRole(id);
  const role = response.data;

  const canEdit = canUpdate && role.name !== "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title={formatRoleName(role.name)}
        subtitle="View role information, assignments, and permissions."
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
          },
        ]}
        action={
          canEdit
            ? {
                label: "Edit",
                href: `/roles/${role.id}/edit`,
                icon: Pencil,
              }
            : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Role information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <TypographyMuted>Name</TypographyMuted>

              <div className="mt-2">
                {role.system ? (
                  <StatusBadge status={role.name} />
                ) : (
                  <TypographyP className="font-medium">
                    {formatRoleName(role.name)}
                  </TypographyP>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Description</TypographyMuted>

              <TypographyP className="mt-1">
                {role.description || "No description"}
              </TypographyP>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <TypographyMuted>Scope</TypographyMuted>

                <div className="mt-2">
                  <StatusBadge status={role.scope} />
                </div>
              </div>

              <div>
                <TypographyMuted>Type</TypographyMuted>

                <div className="mt-2">
                  <StatusBadge status={role.system ? "SYSTEM" : "CUSTOM"} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <TypographyMuted>Users</TypographyMuted>

              <TypographyH3 className="mt-1">{role.userCount}</TypographyH3>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Invitations</TypographyMuted>

              <TypographyH3 className="mt-1">
                {role.invitationCount}
              </TypographyH3>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Permissions</TypographyMuted>

              <TypographyH3 className="mt-1">
                {role.permissionCount}
              </TypographyH3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>

        <CardContent>
          {role.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission.id} variant="outline">
                  {permission.name}
                </Badge>
              ))}
            </div>
          ) : (
            <TypographyMuted>
              This role does not have any permissions.
            </TypographyMuted>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
