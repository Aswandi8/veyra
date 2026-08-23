import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";

import { SocialShareForm } from "@/components/social-shares/social-share-form";

import { PERMISSIONS } from "@/lib/permissions/constants";

import {
  requireAdminAccess,
  requireWebsitePermission,
} from "@/lib/permissions/guards";

import { getServerSocialShare } from "@/lib/social-shares/server";

// ============================================================
// PROPS
// ============================================================

interface EditSocialSharePageProps {
  params: Promise<{
    id: string;
  }>;

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

export default async function EditSocialSharePage({
  params,
  searchParams,
}: EditSocialSharePageProps) {
  const access = await requireAdminAccess();

  const { id } = await params;

  const query = await searchParams;

  const websiteId = first(query.website);

  if (!websiteId) {
    notFound();
  }

  requireWebsitePermission(access, websiteId, PERMISSIONS.socialShare.update);

  const response = await getServerSocialShare(id, websiteId);

  if (!response.success || !response.data) {
    notFound();
  }

  const socialShare = response.data;

  if (socialShare.websiteId !== websiteId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Edit Social Share"
        subtitle={`Update ${socialShare.title} Social Share information.`}
        items={[
          {
            label: "Dashboard",

            href: "/dashboard",
          },

          {
            label: "Social Shares",

            href: `/social-shares?website=${encodeURIComponent(websiteId)}`,
          },

          {
            label: socialShare.title,

            href: `/social-shares/${socialShare.id}?website=${encodeURIComponent(
              websiteId,
            )}`,
          },

          {
            label: "Edit",
          },
        ]}
      />

      <SocialShareForm
        mode="edit"
        socialShare={socialShare}
        websites={[
          {
            id: socialShare.website.id,

            name: socialShare.website.name,

            domain: socialShare.website.domain,
          },
        ]}
        defaultWebsiteId={socialShare.websiteId}
      />
    </div>
  );
}
