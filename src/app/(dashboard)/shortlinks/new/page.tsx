import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { ShortLinkForm } from "@/components/shortlinks/shortlink-form";

import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";

export default async function NewShortLinkPage() {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.shortlink.create);

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Create ShortLink"
        subtitle="Create a global shortlink with an optional image or video preview."
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "ShortLinks", href: "/shortlinks" },
          { label: "Create" },
        ]}
      />

      <ShortLinkForm mode="create" />
    </div>
  );
}
