import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { TypographyP } from "@/components/ui/typography";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Dashboard"
        subtitle="Welcome to Veyra Central Management System."
        items={[{ label: "Dashboard", href: "/dashboard" }]}
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <TypographyP>Dashboard Veyra siap digunakan.</TypographyP>
      </div>
    </div>
  );
}
