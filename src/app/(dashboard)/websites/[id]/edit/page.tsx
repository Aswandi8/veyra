import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { WebsiteForm } from "@/components/websites/website-form";

import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getServerWebsite } from "@/lib/websites/server";

interface EditWebsitePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWebsitePage({
  params,
}: EditWebsitePageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.website.update);

  const { id } = await params;

  const response = await getServerWebsite(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const website = response.data;

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Edit Website"
        subtitle={`Update ${website.name} website information.`}
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
            href: `/websites/${website.id}`,
          },
          {
            label: "Edit",
          },
        ]}
      />

      <WebsiteForm mode="edit" website={website} />
    </div>
  );
}
