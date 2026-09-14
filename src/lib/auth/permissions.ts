import type { AdminRole, Permission, PermissionId, Role } from "@/types/cms";

export const PERMISSIONS: Permission[] = [
  {
    id: "pages:manage",
    name: "Manage Pages Status",
    category: "System",
    description: "Toggle entire public pages (e.g. Services, Work) active or inactive with custom downtime messages.",
  },
  {
    id: "sections:manage",
    name: "Manage Page Sections",
    category: "System",
    description: "Turn specific sections on or off and customize section headings, badges, and subheadings.",
  },
  {
    id: "maintenance:manage",
    name: "Manage Maintenance Mode",
    category: "System",
    description: "Toggle platform-wide maintenance mode to hold public visitors on a branded downtime screen.",
  },
  {
    id: "settings:manage",
    name: "Manage Site Settings",
    category: "System",
    description: "Update official brand name, emails, phone numbers, and Colombo headquarters office details.",
  },
  {
    id: "users:manage",
    name: "Manage Administrators & RBAC",
    category: "Security",
    description: "Create administrative users, assign roles, and audit permission matrices.",
  },
  {
    id: "services:manage",
    name: "Manage Services Catalog",
    category: "Content",
    description: "Add, edit, reorder, toggle visibility, and delete core service offerings and Lucide icons.",
  },
  {
    id: "projects:manage",
    name: "Manage Portfolio Projects",
    category: "Content",
    description: "Add, edit, toggle visibility, and delete case studies, tags, and client project portfolios.",
  },
  {
    id: "team:manage",
    name: "Manage Leadership Team",
    category: "Content",
    description: "Update executive roster, avatar images, roles, and LinkedIn profile linkages.",
  },
  {
    id: "blog:manage",
    name: "Manage Blog & Insights",
    category: "Content",
    description: "Create articles, toggle draft vs published states, pin featured stories, and manage article tags.",
  },
  {
    id: "faqs:manage",
    name: "Manage Common Questions (FAQ)",
    category: "Content",
    description: "Add, edit, reorder, and remove accordion FAQ entries across the web experience.",
  },
  {
    id: "inquiries:read",
    name: "View Client Inquiries",
    category: "Communication",
    description: "Access the inbound contact submissions inbox to read messages from potential clients.",
  },
  {
    id: "inquiries:manage",
    name: "Manage Inquiry Workflows",
    category: "Communication",
    description: "Change inquiry status (New, In Review, Contacted, Archived) and log internal notes.",
  },
];

export const ROLES: Record<AdminRole, Role> = {
  super_admin: {
    id: "super_admin",
    name: "Super Administrator",
    description: "Full, unrestricted administrative authority across system settings, maintenance, users, and all content.",
    permissions: [
      "pages:manage",
      "sections:manage",
      "maintenance:manage",
      "settings:manage",
      "users:manage",
      "services:manage",
      "projects:manage",
      "team:manage",
      "blog:manage",
      "faqs:manage",
      "inquiries:read",
      "inquiries:manage",
    ],
  },
  content_admin: {
    id: "content_admin",
    name: "Content Administrator",
    description: "Authority to manage all content catalogs, section configurations, and client inquiries without system-level permissions.",
    permissions: [
      "pages:manage",
      "sections:manage",
      "services:manage",
      "projects:manage",
      "team:manage",
      "blog:manage",
      "faqs:manage",
      "inquiries:read",
      "inquiries:manage",
    ],
  },
  editor: {
    id: "editor",
    name: "Staff Content Editor",
    description: "Permission to draft and update services, projects, blog articles, and FAQs.",
    permissions: [
      "services:manage",
      "projects:manage",
      "team:manage",
      "blog:manage",
      "faqs:manage",
      "inquiries:read",
    ],
  },
  viewer: {
    id: "viewer",
    name: "Auditor / Read-only Viewer",
    description: "Read-only access to view CMS content and inquiries without mutation privileges.",
    permissions: [
      "inquiries:read",
    ],
  },
};

export function hasPermission(role: AdminRole | undefined, permission: PermissionId): boolean {
  if (!role) return false;
  const roleConfig = ROLES[role];
  if (!roleConfig) return false;
  return roleConfig.permissions.includes(permission);
}

export function getRolePermissions(role: AdminRole): Permission[] {
  const roleConfig = ROLES[role];
  if (!roleConfig) return [];
  return PERMISSIONS.filter((p) => roleConfig.permissions.includes(p.id));
}

export function searchPermissions(query: string): Permission[] {
  if (!query.trim()) return PERMISSIONS;
  const q = query.toLowerCase();
  return PERMISSIONS.filter(
    (p) =>
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}
