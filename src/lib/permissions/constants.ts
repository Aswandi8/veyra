export const ROLE_NAMES = {
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  teamLead: "TEAM_LEAD",
  contentManager: "CONTENT_MANAGER",
  editor: "EDITOR",
  designer: "DESIGNER",
  analyst: "ANALYST",
  auditor: "AUDITOR",
} as const;

export const PERMISSIONS = {
  user: {
    read: "user.read",
    create: "user.create",
    update: "user.update",
    delete: "user.delete",
  },

  role: {
    read: "role.read",
    create: "role.create",
    update: "role.update",
    delete: "role.delete",
  },

  website: {
    read: "website.read",
    create: "website.create",
    update: "website.update",
    delete: "website.delete",
  },

  member: {
    read: "member.read",
    invite: "member.invite",
    update: "member.update",
    remove: "member.remove",
  },

  video: {
    read: "video.read",
    create: "video.create",
    update: "video.update",
    delete: "video.delete",
    publish: "video.publish",
  },

  category: {
    read: "category.read",
    create: "category.create",
    update: "category.update",
    delete: "category.delete",
  },

  view: {
    read: "view.read",
  },

  audit: {
    read: "audit.read",
  },

  apiClient: {
    read: "api_client.read",
    create: "api_client.create",
    revoke: "api_client.revoke",
  },
  socialShare: {
    read: "social_share.read",
    create: "social_share.create",
    update: "social_share.update",
    delete: "social_share.delete",
  },
} as const;
