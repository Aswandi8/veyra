import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/common/dashboard/page-breadcrumb";
import { MemberRoleForm } from "@/components/websites/members/member-role-form";

import { getServerMember, getServerMemberRoles } from "@/lib/members/server";

import { PERMISSIONS } from "@/lib/permissions/constants";
import {
  requireAdminAccess,
  requireWebsitePermission,
} from "@/lib/permissions/guards";

import { getServerWebsite } from "@/lib/websites/server";

interface EditMemberRolePageProps {
  params: Promise<{
    id: string;
    userId: string;
  }>;
}

export default async function EditMemberRolePage({
  params,
}: EditMemberRolePageProps) {
  const access = await requireAdminAccess();

  const { id: websiteId, userId } = await params;

  requireWebsitePermission(access, websiteId, PERMISSIONS.member.update);

  const [websiteResponse, member, roles] = await Promise.all([
    getServerWebsite(websiteId),

    getServerMember(websiteId, userId),

    getServerMemberRoles(websiteId),
  ]);

  if (!websiteResponse.success || !websiteResponse.data || !member) {
    notFound();
  }

  const website = websiteResponse.data;

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        title="Edit Member Role"
        subtitle={`Update ${member.name}'s role for ${website.name}.`}
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
            label: "Members",
            href: `/websites/${website.id}/members`,
          },
          {
            label: member.name,
          },
          {
            label: "Edit",
          },
        ]}
      />

      <MemberRoleForm websiteId={website.id} member={member} roles={roles} />
    </div>
  );
}
