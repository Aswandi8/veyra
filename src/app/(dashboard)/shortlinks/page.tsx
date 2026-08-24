import { Plus } from "lucide-react";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { DataTablePagination } from "@/components/common/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/common/data-table/data-table-provider";
import { DataTableToolbar } from "@/components/common/data-table/data-table-toolbar";
import { GlobalShortLinkAnalytics } from "@/components/shortlinks/shortlink-analytics";
import { ShortLinksTable } from "@/components/shortlinks/shortlinks-table";
import { Card, CardContent } from "@/components/ui/card";

import { hasGlobalPermission } from "@/lib/permissions/access";
import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireGlobalPermission,
} from "@/lib/permissions/guards";
import { getShortLinksFilters } from "@/lib/shortlinks/filters";
import { shortLinksQuerySchema } from "@/lib/shortlinks/schema";
import {
  getServerShortLinkGlobalAnalytics,
  getServerShortLinks,
} from "@/lib/shortlinks/server";

interface ShortLinksPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: string;
    status?: string;
    previewType?: string;
  }>;
}

export default async function ShortLinksPage({
  searchParams,
}: ShortLinksPageProps) {
  const access = await requireAdminAccess();

  requireGlobalPermission(access, PERMISSIONS.shortlink.read);

  const canCreate = hasGlobalPermission(access, PERMISSIONS.shortlink.create);
  const canUpdate = hasGlobalPermission(access, PERMISSIONS.shortlink.update);
  const canDelete = hasGlobalPermission(access, PERMISSIONS.shortlink.delete);

  const params = await searchParams;

  const parsed = shortLinksQuerySchema.safeParse({
    q: params.q,
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    order: params.order,
    status: params.status,
    previewType: params.previewType,
  });

  const query = parsed.success
    ? parsed.data
    : shortLinksQuerySchema.parse({
        q: "",
        page: 1,
        limit: 20,
        sort: "createdAt",
        order: "desc",
      });

  const [response, analyticsResponse] = await Promise.all([
    getServerShortLinks(
      query.q,
      query.page,
      query.limit,
      query.sort,
      query.order,
      query.status,
      query.previewType,
    ),
    getServerShortLinkGlobalAnalytics(30),
  ]);

  const filters = getShortLinksFilters();

  const paginationQuery = {
    q: query.q || undefined,
    sort: query.sort,
    order: query.order,
    status: query.status,
    previewType: query.previewType,
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="ShortLinks"
        subtitle="Manage global shortlinks, social previews, redirects, and analytics."
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "ShortLinks" },
        ]}
        action={
          canCreate
            ? {
                label: "Create",
                href: "/shortlinks/new",
                icon: Plus,
              }
            : undefined
        }
      />

      {analyticsResponse.success && analyticsResponse.data ? (
        <GlobalShortLinkAnalytics analytics={analyticsResponse.data} />
      ) : null}

      <Card className="shadow-none">
        <CardContent>
          <DataTableProvider>
            <div className="space-y-6">
              <DataTableToolbar
                searchValue={query.q}
                searchPlaceholder="Search slug, title, or destination..."
                limit={query.limit}
                filters={filters}
                filterValues={{
                  status: query.status,
                  previewType: query.previewType,
                }}
              />

              <ShortLinksTable
                shortLinks={response.data}
                limit={query.limit}
                canUpdate={canUpdate}
                canDelete={canDelete}
                emptyMessage={
                  query.q
                    ? "No shortlinks match your search."
                    : "No shortlinks found."
                }
                currentSort={query.sort}
                currentOrder={query.order}
              />

              <DataTablePagination
                pagination={response.pagination}
                basePath="/shortlinks"
                query={paginationQuery}
                itemLabel="shortlinks"
              />
            </div>
          </DataTableProvider>
        </CardContent>
      </Card>
    </div>
  );
}
