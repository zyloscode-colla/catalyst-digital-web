export type AdminRole = 'super_admin' | 'content_admin' | 'editor' | 'viewer';

export type PermissionId =
  | 'pages:manage'
  | 'sections:manage'
  | 'maintenance:manage'
  | 'settings:manage'
  | 'users:manage'
  | 'services:manage'
  | 'projects:manage'
  | 'team:manage'
  | 'blog:manage'
  | 'faqs:manage'
  | 'inquiries:read'
  | 'inquiries:manage'
  | (string & {});

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  roleId: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Permission {
  id: PermissionId;
  name: string;
  category: 'System' | 'Content' | 'Communication' | 'Security' | string;
  description: string;
}

export interface Role {
  id: AdminRole;
  name: string;
  description: string;
  permissions: PermissionId[];
}

export interface SiteSettings {
  id: string;
  siteName: string;
  tagline: string;
  primaryEmail: string;
  supportEmail: string;
  phone: string;
  headquarters: string;
  officeAddress1: string;
  officeAddress2: string;
  linkedinUrl: string;
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  updatedAt: string;
}

export interface PageConfig {
  slug: string;
  title: string;
  isActive: boolean;
  offlineMessage?: string;
  metaDescription?: string;
  displayOrder: number;
  updatedAt: string;
}

export interface SectionConfig {
  id: string;
  pageSlug: string;
  sectionKey: string;
  sectionName: string;
  isActive: boolean;
  eyebrow?: string;
  badge?: string;
  heading?: string;
  subheading?: string;
  contentJson?: Record<string, unknown>;
  displayOrder: number;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date: string;
  tags: string[];
  coverImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqItemCMS {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineMilestoneCMS {
  id: string;
  year: string;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CoreValueCMS {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ServiceCaseCMS {
  id: string;
  category: string;
  title: string;
  resultTag: string;
  isActive: boolean;
  displayOrder: number;
}

export interface WorkResultCMS {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface KeyMetricCMS {
  id: string;
  context: 'home' | 'about';
  label: string;
  value: number;
  suffix?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface FeaturedCaseStudyCMS {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  ctaHref: string;
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  status: 'new' | 'in_review' | 'contacted' | 'archived';
  createdAt: string;
  ipAddress?: string;
}
