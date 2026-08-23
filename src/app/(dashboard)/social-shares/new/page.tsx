import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";

import { SocialShareForm } from "@/components/social-shares/social-share-form";

import { hasWebsitePermission, isSuperAdmin } from "@/lib/permissions/access";

import { PERMISSIONS } from "@/lib/permissions/constants";

import { requireAdminAccess } from "@/lib/permissions/guards";

import { getServerWebsites } from "@/lib/websites/server";

// ============================================================
// PROPS
// ============================================================

interface NewSocialSharePageProps {
  searchParams: Promise<{
    website?: string | string[];
  }>;
}

// ============================================================
// HELPERS
// ============================================================

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

// ============================================================
// PAGE
// ============================================================

export default async function NewSocialSharePage({
  searchParams,
}: NewSocialSharePageProps) {
  // ==========================================================
  // ACCESS
  // ==========================================================

  const access = await requireAdminAccess();

  // ==========================================================
  // QUERY
  // ==========================================================

  const params = await searchParams;

  const requestedWebsiteId = first(params.website);

  // ==========================================================
  // WEBSITES
  // ==========================================================

  /*
   * Endpoint websites Central API sudah mengembalikan
   * hanya website yang dapat dilihat oleh user.
   *
   * Kita membutuhkan domain untuk membuat Share URL preview.
   */
  const websitesResponse = await getServerWebsites("", 1, 100, "name", "asc");

  const websites = websitesResponse.data
    .filter(
      (website) =>
        website.status === "ACTIVE" &&
        (isSuperAdmin(access) ||
          hasWebsitePermission(
            access,
            website.id,
            PERMISSIONS.socialShare.create,
          )),
    )
    .map((website) => ({
      id: website.id,

      name: website.name,

      domain: website.domain,
    }));

  // ==========================================================
  // DEFAULT WEBSITE
  // ==========================================================

  const requestedWebsite = requestedWebsiteId
    ? websites.find((website) => website.id === requestedWebsiteId)
    : undefined;

  const defaultWebsite = requestedWebsite ?? websites[0];

  // ==========================================================
  // EMPTY ACCESS
  // ==========================================================

  if (!defaultWebsite) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          title="Create Social Share"
          subtitle="Create a social media video share."
          items={[
            {
              label: "Dashboard",

              href: "/dashboard",
            },

            {
              label: "Social Shares",

              href: "/social-shares",
            },

            {
              label: "Create",
            },
          ]}
        />

        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No website available</p>

          <p className="mt-1 text-sm text-muted-foreground">
            You do not have permission to create a Social Share for an active
            website.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Create Social Share"
        subtitle="Create a social media video share using external CDN assets."
        items={[
          {
            label: "Dashboard",

            href: "/dashboard",
          },

          {
            label: "Social Shares",

            href: requestedWebsiteId
              ? `/social-shares?website=${encodeURIComponent(
                  defaultWebsite.id,
                )}`
              : "/social-shares",
          },

          {
            label: "Create",
          },
        ]}
      />

      <SocialShareForm
        websites={websites}
        defaultWebsiteId={defaultWebsite.id}
      />
    </div>
  );
}
