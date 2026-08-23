import { Plus } from "lucide-react";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Roles"
        items={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Roles",
          },
        ]}
        action={{
          label: "Create",
          href: "/roles/create",
          icon: Plus,
        }}
      />
    </div>
  );
}
