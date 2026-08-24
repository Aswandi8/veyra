import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { ShortLinkForm } from "@/components/shortlinks/shortlink-form";

import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getServerShortLink } from "@/lib/shortlinks/server";

interface EditShortLinkPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditShortLinkPage({
  params,
}: EditShortLinkPageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.shortlink.update);

  const { id } = await params;
  const response = await getServerShortLink(id);

  if (!response.success || !response.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Edit ShortLink"
        subtitle={`Update /${response.data.slug}.`}
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "ShortLinks", href: "/shortlinks" },
          {
            label: `/${response.data.slug}`,
            href: `/shortlinks/${response.data.id}`,
          },
          { label: "Edit" },
        ]}
      />

      <ShortLinkForm mode="edit" shortLink={response.data} />
    </div>
  );
}
