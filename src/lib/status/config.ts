import type { ComponentProps } from "react";

import type { Badge } from "@/components/ui/badge";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

export interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  // User status
  ACTIVE: {
    label: "Active",
    variant: "default",
  },
  INACTIVE: {
    label: "Inactive",
    variant: "secondary",
  },
  SUSPENDED: {
    label: "Suspended",
    variant: "outline",
  },
  BANNED: {
    label: "Banned",
    variant: "destructive",
  },

  // Video status
  DRAFT: {
    label: "Draft",
    variant: "secondary",
  },
  PROCESSING: {
    label: "Processing",
    variant: "outline",
  },
  READY: {
    label: "Ready",
    variant: "default",
  },
  PUBLISHED: {
    label: "Published",
    variant: "default",
  },
  ARCHIVED: {
    label: "Archived",
    variant: "secondary",
  },

  // Visibility
  PUBLIC: {
    label: "Public",
    variant: "default",
  },
  PRIVATE: {
    label: "Private",
    variant: "secondary",
  },
  UNLISTED: {
    label: "Unlisted",
    variant: "outline",
  },

  // Website
  MAINTENANCE: {
    label: "Maintenance",
    variant: "outline",
  },

  // API client
  REVOKED: {
    label: "Revoked",
    variant: "destructive",
  },

  // Verification
  VERIFIED: {
    label: "Verified",
    variant: "default",
  },
  UNVERIFIED: {
    label: "Unverified",
    variant: "secondary",
  },

  // Generic
  ENABLED: {
    label: "Enabled",
    variant: "default",
  },
  DISABLED: {
    label: "Disabled",
    variant: "secondary",
  },

  // Invitation
  PENDING: {
    label: "Pending",
    variant: "outline",
  },
  USED: {
    label: "Used",
    variant: "default",
  },
  EXPIRED: {
    label: "Expired",
    variant: "secondary",
  },

  // Role scope
  GLOBAL: {
    label: "Global",
    variant: "brand5",
  },
  WEBSITE: {
    label: "Website",
    variant: "brand6",
  },

  // Role type
  SYSTEM: {
    label: "System",
    variant: "brand4",
  },
  CUSTOM: {
    label: "Custom",
    variant: "brand7",
  },

  // System roles
  SUPER_ADMIN: {
    label: "Super Admin",
    variant: "brand1",
  },
  ADMIN: {
    label: "Admin",
    variant: "brand2",
  },
  TEAM_LEAD: {
    label: "Team Lead",
    variant: "brand3",
  },
  CONTENT_MANAGER: {
    label: "Content Manager",
    variant: "brand4",
  },
  EDITOR: {
    label: "Editor",
    variant: "brand5",
  },
  DESIGNER: {
    label: "Designer",
    variant: "brand6",
  },
  ANALYST: {
    label: "Analyst",
    variant: "brand7",
  },
  AUDITOR: {
    label: "Auditor",
    variant: "brand8",
  },
};

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getStatusConfig(status: string): StatusConfig {
  const normalized = status.trim().toUpperCase();

  return (
    STATUS_CONFIG[normalized] ?? {
      label: formatStatus(normalized),
      variant: "outline",
    }
  );
}
