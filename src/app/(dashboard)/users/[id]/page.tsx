import { Pencil, ShieldCheck } from "lucide-react";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { StatusBadge } from "@/components/common/status/status-badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typography";

import { formatDateTime } from "@/lib/format/date";

import { hasGlobalPermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
  requireResource,
} from "@/lib/permissions/guards";

import { getServerUser } from "@/lib/users/server";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  /* =========================================================
     ACCESS
  ========================================================= */

  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.user.read);

  const canUpdate = hasGlobalPermission(access, PERMISSIONS.user.update);

  /* =========================================================
     USER
  ========================================================= */

  const response = await getServerUser(id);
  const user = requireResource(response.data);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="User Detail"
        subtitle="View account information, access, and activity."
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users", href: "/users" },
          { label: "Detail" },
        ]}
        action={
          canUpdate
            ? {
                label: "Edit",
                href: `/users/${user.id}/edit`,
                icon: Pencil,
              }
            : undefined
        }
      />

      {/* PROFILE */}

      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <Avatar className="size-24">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}

              <AvatarFallback className="text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="truncate font-display text-2xl font-semibold tracking-tight">
                  {user.name}
                </h1>

                {user.protected ? (
                  <Badge variant="outline" className="gap-1">
                    <ShieldCheck className="size-3" />
                    Protected
                  </Badge>
                ) : null}
              </div>

              <TypographyMuted className="mt-1">{user.email}</TypographyMuted>

              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <StatusBadge status={user.banned ? "BANNED" : user.status} />

                <StatusBadge
                  status={user.emailVerified ? "VERIFIED" : "UNVERIFIED"}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatisticCard label="Sessions" value={user.statistics.sessions} />
        <StatisticCard label="Accounts" value={user.statistics.accounts} />
        <StatisticCard label="Websites" value={user.statistics.websites} />
        <StatisticCard
          label="Global Roles"
          value={user.statistics.globalRoles}
        />
        <StatisticCard
          label="Invitations"
          value={user.statistics.invitations}
        />
        <StatisticCard label="Audit Logs" value={user.statistics.auditLogs} />
      </div>

      {/* ACCOUNT + ROLES */}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Information label="Status" value={user.status} />

            <Separator />

            <Information
              label="Email verification"
              value={user.emailVerified ? "Verified" : "Unverified"}
            />

            <Separator />

            <Information label="Banned" value={user.banned ? "Yes" : "No"} />

            {user.banned ? (
              <>
                <Separator />

                <Information label="Ban reason" value={user.banReason || "—"} />

                <Separator />

                <Information
                  label="Ban expires"
                  value={
                    user.banExpires ? formatDateTime(user.banExpires) : "Never"
                  }
                />
              </>
            ) : null}

            <Separator />

            <Information
              label="Created"
              value={formatDateTime(user.createdAt)}
            />

            <Separator />

            <Information
              label="Last updated"
              value={formatDateTime(user.updatedAt)}
            />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Global Roles</CardTitle>
          </CardHeader>

          <CardContent>
            {user.globalRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.globalRoles.map((role) => (
                  <Badge key={role.id} variant="outline">
                    {role.name.replaceAll("_", " ")}
                  </Badge>
                ))}
              </div>
            ) : (
              <TypographyMuted>No global roles assigned.</TypographyMuted>
            )}
          </CardContent>
        </Card>
      </div>

      {/* WEBSITE ACCESS */}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Website Access</CardTitle>
        </CardHeader>

        <CardContent>
          {user.websites.length > 0 ? (
            <div className="divide-y">
              {user.websites.map((website) => (
                <div
                  key={website.id}
                  className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{website.name}</p>

                    <TypographyMuted className="mt-1">
                      /{website.slug}
                    </TypographyMuted>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={website.status} />

                    <Badge variant="outline">
                      {website.role.name.replaceAll("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TypographyMuted>
              This user does not have access to any website.
            </TypographyMuted>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatisticCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-5">
        <TypographyMuted>{label}</TypographyMuted>

        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function Information({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <TypographyMuted>{label}</TypographyMuted>

      <p className="text-right text-sm font-medium">{value}</p>
    </div>
  );
}
