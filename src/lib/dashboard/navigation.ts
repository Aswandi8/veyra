import {
  Activity,
  FileClock,
  Globe2,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Tags,
  Users,
  Video,
  Share2,
  type LucideIcon,
} from "lucide-react";

import { PERMISSIONS } from "@/lib/permissions/constants";

export type DashboardPermissionScope = "GLOBAL" | "WEBSITE";

export interface DashboardNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;

  permission?: string;

  permissionScope?: DashboardPermissionScope;
}

export interface DashboardNavigationGroup {
  label: string;

  items: readonly DashboardNavigationItem[];
}

export const DASHBOARD_NAVIGATION: readonly DashboardNavigationGroup[] = [
  {
    label: "Main",

    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    label: "Management",

    items: [
      {
        label: "Users",
        href: "/users",
        icon: Users,

        permission: PERMISSIONS.user.read,

        permissionScope: "GLOBAL",
      },

      {
        label: "Roles",
        href: "/roles",
        icon: ShieldCheck,

        permission: PERMISSIONS.role.read,

        permissionScope: "GLOBAL",
      },

      {
        label: "Websites",
        href: "/websites",
        icon: Globe2,

        permission: PERMISSIONS.website.read,

        permissionScope: "WEBSITE",
      },
    ],
  },

  {
    label: "Content",

    items: [
      {
        label: "Videos",
        href: "/videos",
        icon: Video,

        permission: PERMISSIONS.video.read,

        permissionScope: "WEBSITE",
      },
      {
        label: "Social Shares",
        href: "/social-shares",
        icon: Share2,

        permission: PERMISSIONS.socialShare.read,

        permissionScope: "WEBSITE",
      },
      {
        label: "Categories",
        href: "/categories",
        icon: Tags,

        permission: PERMISSIONS.category.read,

        permissionScope: "WEBSITE",
      },
    ],
  },

  {
    label: "Monitoring",

    items: [
      {
        label: "Analytics",
        href: "/analytics",
        icon: Activity,

        permission: PERMISSIONS.view.read,

        permissionScope: "WEBSITE",
      },

      {
        label: "Audit Logs",
        href: "/audit-logs",
        icon: FileClock,

        permission: PERMISSIONS.audit.read,

        permissionScope: "WEBSITE",
      },
    ],
  },

  {
    label: "System",

    items: [
      {
        label: "API Clients",
        href: "/api-clients",
        icon: KeyRound,

        permission: PERMISSIONS.apiClient.read,

        permissionScope: "WEBSITE",
      },
    ],
  },
] as const;
