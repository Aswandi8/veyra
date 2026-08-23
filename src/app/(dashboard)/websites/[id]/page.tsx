import { ExternalLink, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { StatusBadge } from "@/components/common/status/status-badge";
import { WebsiteDeleteButton } from "@/components/websites/website-actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getServerWebsite } from "@/lib/websites/server";

interface WebsiteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WebsiteDetailPage({
  params,
}: WebsiteDetailPageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.website.read);

  const canUpdate = hasGlobalPermission(access, PERMISSIONS.website.update);

  const canDelete = hasGlobalPermission(access, PERMISSIONS.website.delete);

  const { id } = await params;

  const response = await getServerWebsite(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const website = response.data;
  const hasBlockingData =
    website.statistics.videos > 0 ||
    website.statistics.categories > 0 ||
    website.statistics.views > 0 ||
    website.statistics.apiClients > 0;

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title={website.name}
        subtitle="View website information and activity."
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
          },
        ]}
        action={
          canUpdate
            ? {
                label: "Edit",
                href: `/websites/${website.id}/edit`,
                icon: Pencil,
              }
            : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Website information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <TypographyMuted>Name</TypographyMuted>

              <TypographyP className="mt-1 font-medium">
                {website.name}
              </TypographyP>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Slug</TypographyMuted>

              <TypographyP className="mt-1">/{website.slug}</TypographyP>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Domain</TypographyMuted>

              {website.domain ? (
                <div className="mt-1 flex items-center gap-2">
                  <TypographyP>{website.domain}</TypographyP>

                  <ExternalLink className="size-4 text-muted-foreground" />
                </div>
              ) : (
                <TypographyMuted className="mt-1">
                  No domain configured
                </TypographyMuted>
              )}
            </div>

            <Separator />

            <div>
              <TypographyMuted>Description</TypographyMuted>

              <TypographyP className="mt-1">
                {website.description || "No description"}
              </TypographyP>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Status</TypographyMuted>

              <div className="mt-2">
                <StatusBadge status={website.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <TypographyMuted>Members</TypographyMuted>

              <TypographyH3 className="mt-1">
                {website.statistics.members}
              </TypographyH3>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Videos</TypographyMuted>

              <TypographyH3 className="mt-1">
                {website.statistics.videos}
              </TypographyH3>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Categories</TypographyMuted>

              <TypographyH3 className="mt-1">
                {website.statistics.categories}
              </TypographyH3>
            </div>

            <Separator />

            <div>
              <TypographyMuted>Views</TypographyMuted>

              <TypographyH3 className="mt-1">
                {website.statistics.views}
              </TypographyH3>
            </div>

            <Separator />

            <div>
              <TypographyMuted>API Clients</TypographyMuted>

              <TypographyH3 className="mt-1">
                {website.statistics.apiClients}
              </TypographyH3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Website management</CardTitle>

          <CardDescription>
            Manage members and invitations for this website.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Button
            nativeButton={false}
            render={<Link href={`/websites/${website.id}/members`} />}
            variant="outline"
          >
            <Users className="size-4" />
            Members
          </Button>

          <Button
            nativeButton={false}
            render={<Link href={`/websites/${website.id}/invitations`} />}
            variant="outline"
          >
            Invitations
          </Button>
        </CardContent>
      </Card>

      {canDelete ? (
        <Card className="border-destructive/30 shadow-none">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>

            <CardDescription>
              Permanently delete this website and remove it from Veyra.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {hasBlockingData ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <TypographyMuted className="text-destructive">
                  This website cannot be deleted while it still contains
                  content, analytics, or API clients.
                </TypographyMuted>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <TypographyMuted>Videos</TypographyMuted>
                    <TypographyP className="font-medium">
                      {website.statistics.videos}
                    </TypographyP>
                  </div>

                  <div>
                    <TypographyMuted>Categories</TypographyMuted>
                    <TypographyP className="font-medium">
                      {website.statistics.categories}
                    </TypographyP>
                  </div>

                  <div>
                    <TypographyMuted>Views</TypographyMuted>
                    <TypographyP className="font-medium">
                      {website.statistics.views}
                    </TypographyP>
                  </div>

                  <div>
                    <TypographyMuted>API Clients</TypographyMuted>
                    <TypographyP className="font-medium">
                      {website.statistics.apiClients}
                    </TypographyP>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <TypographyP className="font-medium">
                  Delete this website
                </TypographyP>

                <TypographyMuted className="mt-1">
                  {hasBlockingData
                    ? "Remove the blocking data before deleting this website."
                    : "This action cannot be undone."}
                </TypographyMuted>
              </div>

              <WebsiteDeleteButton
                website={website}
                redirectAfterDelete
                disabled={hasBlockingData}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
