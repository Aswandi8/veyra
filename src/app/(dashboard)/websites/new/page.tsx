import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { WebsiteForm } from "@/components/websites/website-form";

import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";

export default async function NewWebsitePage() {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.website.create);

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Create Website"
        subtitle="Create a new website connected to Veyra."
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
            label: "Create",
          },
        ]}
      />

      <WebsiteForm mode="create" />
    </div>
  );
}
