import { Plus } from "lucide-react";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";

import { DataTablePagination } from "@/components/common/data-table/data-table-pagination";

import { DataTableProvider } from "@/components/common/data-table/data-table-provider";

import { DataTableToolbar } from "@/components/common/data-table/data-table-toolbar";

import { SocialSharesTable } from "@/components/social-shares/social-shares-table";

import { Card, CardContent } from "@/components/ui/card";

import { TypographyMuted } from "@/components/ui/typography";

import {
  hasAnyWebsitePermission,
  hasWebsitePermission,
  isSuperAdmin,
} from "@/lib/permissions/access";

import { PERMISSIONS } from "@/lib/permissions/constants";

import { requireAdminAccess } from "@/lib/permissions/guards";

import { getSocialSharesFilters } from "@/lib/social-shares/filters";

import { socialSharesQuerySchema } from "@/lib/social-shares/schema";

import { getServerSocialShares } from "@/lib/social-shares/server";

import type { SocialShareWebsiteOption } from "@/lib/social-shares/types";

import { getServerWebsites } from "@/lib/websites/server";

// ============================================================
// PROPS
// ============================================================

interface SocialSharesPageProps {
  searchParams: Promise<{
    q?: string;

    page?: string;

    limit?: string;

    sort?: string;

    order?: string;

    status?: string;

    website?: string;
  }>;
}

// ============================================================
// PAGE
// ============================================================

export default async function SocialSharesPage({
  searchParams,
}: SocialSharesPageProps) {
  // ==========================================================
  // ACCESS
  // ==========================================================

  const access = await requireAdminAccess();

  const canReadAny =
    isSuperAdmin(access) ||
    hasAnyWebsitePermission(access, PERMISSIONS.socialShare.read);

  // ==========================================================
  // QUERY
  // ==========================================================

  const params = await searchParams;

  const parsed = socialSharesQuerySchema.safeParse({
    q: params.q,

    page: params.page,

    limit: params.limit,

    sort: params.sort,

    order: params.order,

    status: params.status,

    website: params.website,
  });

  const query = parsed.success
    ? parsed.data
    : socialSharesQuerySchema.parse({
        q: "",

        page: 1,

        limit: 20,

        sort: "createdAt",

        order: "desc",
      });

  // ==========================================================
  // WEBSITE OPTIONS
  // ==========================================================

  let websites: SocialShareWebsiteOption[] = [];

  if (isSuperAdmin(access)) {
    const websiteResponse = await getServerWebsites("", 1, 100, "name", "asc");

    websites = websiteResponse.data.map((website) => ({
      id: website.id,

      name: website.name,

      status: website.status,
    }));
  } else {
    websites = access.websites
      .filter((website) =>
        hasWebsitePermission(access, website.id, PERMISSIONS.socialShare.read),
      )
      .map((website) => ({
        id: website.id,

        name: website.name,

        status: website.status,
      }));
  }

  // ==========================================================
  // ACTIVE WEBSITES
  // ==========================================================

  const activeWebsites = websites.filter(
    (website) => website.status === "ACTIVE",
  );

  // ==========================================================
  // SELECTED WEBSITE
  // ==========================================================

  const selectedWebsite = query.website
    ? activeWebsites.find((website) => website.id === query.website)
    : undefined;

  /*
   * undefined means:
   *
   * All Websites
   */
  const selectedWebsiteId = selectedWebsite?.id;

  // ==========================================================
  // NO ACCESS
  // ==========================================================

  if (!canReadAny || activeWebsites.length === 0) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          title="Social Shares"
          subtitle="Manage social media video shares."
          items={[
            {
              label: "Dashboard",

              href: "/dashboard",
            },

            {
              label: "Social Shares",
            },
          ]}
        />

        <Card className="shadow-none">
          <CardContent>
            <div className="flex min-h-32 items-center justify-center">
              <TypographyMuted>
                No active website with Social Share access was found.
              </TypographyMuted>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================================
  // CREATE PERMISSION
  // ==========================================================

  const canCreate =
    isSuperAdmin(access) ||
    activeWebsites.some((website) =>
      hasWebsitePermission(access, website.id, PERMISSIONS.socialShare.create),
    );

  // ==========================================================
  // UPDATE PERMISSIONS
  // ==========================================================

  /*
   * IMPORTANT:
   *
   * Jangan kirim callback/function dari Server Component
   * ke SocialSharesTable karena itu Client Component.
   *
   * Kita kirim array ID website yang serializable.
   */
  const canUpdateWebsiteIds = activeWebsites
    .filter(
      (website) =>
        isSuperAdmin(access) ||
        hasWebsitePermission(
          access,
          website.id,
          PERMISSIONS.socialShare.update,
        ),
    )
    .map((website) => website.id);

  // ==========================================================
  // DELETE PERMISSIONS
  // ==========================================================

  const canDeleteWebsiteIds = activeWebsites
    .filter(
      (website) =>
        isSuperAdmin(access) ||
        hasWebsitePermission(
          access,
          website.id,
          PERMISSIONS.socialShare.delete,
        ),
    )
    .map((website) => website.id);

  // ==========================================================
  // DATA
  // ==========================================================

  const socialShares = await getServerSocialShares(
    query.q,
    query.page,
    query.limit,
    query.sort,
    query.order,
    query.status,
    selectedWebsiteId,
  );

  // ==========================================================
  // FILTERS
  // ==========================================================

  const filters = getSocialSharesFilters(activeWebsites);

  // ==========================================================
  // PAGINATION QUERY
  // ==========================================================

  const paginationQuery = {
    q: query.q || undefined,

    sort: query.sort,

    order: query.order,

    status: query.status,

    /*
     * undefined ketika All Websites.
     */
    website: selectedWebsiteId,
  };

  // ==========================================================
  // SUBTITLE
  // ==========================================================

  const subtitle = selectedWebsite
    ? `Manage social media video shares for ${selectedWebsite.name}.`
    : "Manage social media video shares across all accessible websites.";

  // ==========================================================
  // CREATE URL
  // ==========================================================

  const createHref = selectedWebsiteId
    ? `/social-shares/new?website=${encodeURIComponent(selectedWebsiteId)}`
    : "/social-shares/new";

  // ==========================================================
  // EMPTY MESSAGE
  // ==========================================================

  const emptyMessage = query.q
    ? "No social shares match your search."
    : selectedWebsite
      ? `No social shares found for ${selectedWebsite.name}.`
      : "No social shares found.";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Social Shares"
        subtitle={subtitle}
        items={[
          {
            label: "Dashboard",

            href: "/dashboard",
          },

          {
            label: "Social Shares",
          },
        ]}
        action={
          canCreate
            ? {
                label: "Create",

                href: createHref,

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
                searchPlaceholder="Search title, slug, website, or target..."
                limit={query.limit}
                filters={filters}
                filterValues={{
                  website: selectedWebsiteId,

                  status: query.status,
                }}
              />

              <SocialSharesTable
                socialShares={socialShares.data}
                limit={query.limit}
                emptyMessage={emptyMessage}
                currentSort={query.sort}
                currentOrder={query.order}
                canUpdateWebsiteIds={canUpdateWebsiteIds}
                canDeleteWebsiteIds={canDeleteWebsiteIds}
              />

              <DataTablePagination
                pagination={socialShares.pagination}
                basePath="/social-shares"
                query={paginationQuery}
                itemLabel="social shares"
              />
            </div>
          </DataTableProvider>
        </CardContent>
      </Card>
    </div>
  );
}
