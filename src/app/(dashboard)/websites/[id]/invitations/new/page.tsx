import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { InvitationForm } from "@/components/websites/invitations/invitation-form";

import { getServerInvitationRoles } from "@/lib/invitations/server";

import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireWebsitePermission,
} from "@/lib/permissions/guards";

import { getServerWebsite } from "@/lib/websites/server";

interface NewInvitationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewInvitationPage({
  params,
}: NewInvitationPageProps) {
  const access = await requireAdminAccess();

  const { id: websiteId } = await params;

  requireWebsitePermission(access, websiteId, PERMISSIONS.member.invite);

  const [websiteResponse, roles] = await Promise.all([
    getServerWebsite(websiteId),

    getServerInvitationRoles(websiteId),
  ]);

  if (!websiteResponse.success || !websiteResponse.data) {
    notFound();
  }

  const website = websiteResponse.data;

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Invite Member"
        subtitle={`Invite a member to ${website.name}.`}
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
            label: "Invitations",
            href: `/websites/${website.id}/invitations`,
          },
          {
            label: "Invite",
          },
        ]}
      />

      <InvitationForm websiteId={website.id} roles={roles} />
    </div>
  );
}
