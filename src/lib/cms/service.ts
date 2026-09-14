import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { initialCMSStore } from "./store";
import type {
  AdminUser,
  BlogPostItem,
  ContactInquiry,
  CoreValueCMS,
  FaqItemCMS,
  FeaturedCaseStudyCMS,
  KeyMetricCMS,
  PageConfig,
  ProjectItem,
  SectionConfig,
  ServiceCaseCMS,
  ServiceItem,
  SiteSettings,
  TeamMemberItem,
  TimelineMilestoneCMS,
  WorkResultCMS,
} from "@/types/cms";

// Global in-memory cache to support seamless mutation when Supabase credentials are not yet entered
const memoryStore = { ...initialCMSStore };

// ==============================================================================
// 1. Site Settings & Maintenance
// ==============================================================================

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").single();
      if (!error && data) {
        return {
          id: data.id,
          siteName: data.site_name,
          tagline: data.tagline,
          primaryEmail: data.primary_email,
          supportEmail: data.support_email,
          phone: data.phone,
          headquarters: data.headquarters,
          officeAddress1: data.office_address_1,
          officeAddress2: data.office_address_2,
          linkedinUrl: data.linkedin_url,
          maintenanceMode: Boolean(data.maintenance_mode),
          maintenanceTitle: data.maintenance_title,
          maintenanceMessage: data.maintenance_message,
          updatedAt: data.updated_at,
        };
      }
    }
  }
  return memoryStore.siteSettings;
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const updated: SiteSettings = {
    ...memoryStore.siteSettings,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.siteSettings = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("site_settings").update({
        site_name: updated.siteName,
        tagline: updated.tagline,
        primary_email: updated.primaryEmail,
        support_email: updated.supportEmail,
        phone: updated.phone,
        headquarters: updated.headquarters,
        office_address_1: updated.officeAddress1,
        office_address_2: updated.officeAddress2,
        linkedin_url: updated.linkedinUrl,
        maintenance_mode: updated.maintenanceMode,
        maintenance_title: updated.maintenanceTitle,
        maintenance_message: updated.maintenanceMessage,
        updated_at: updated.updatedAt,
      }).eq("id", "default");
    }
  }
  return updated;
}

// ==============================================================================
// 2. Pages Configuration
// ==============================================================================

export async function getPagesConfig(): Promise<PageConfig[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data, error } = await supabase.from("pages_config").select("*").order("display_order");
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          slug: d.slug,
          title: d.title,
          isActive: Boolean(d.is_active),
          offlineMessage: d.offline_message,
          metaDescription: d.meta_description,
          displayOrder: d.display_order,
          updatedAt: d.updated_at,
        }));
      }
    }
  }
  return Object.values(memoryStore.pagesConfig).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getPageConfig(slug: string): Promise<PageConfig | null> {
  const pages = await getPagesConfig();
  return pages.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function togglePageActive(slug: string, isActive: boolean, offlineMessage?: string): Promise<PageConfig> {
  const current = memoryStore.pagesConfig[slug] || {
    slug,
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    isActive: true,
    displayOrder: 99,
    updatedAt: new Date().toISOString(),
  };

  const updated: PageConfig = {
    ...current,
    isActive,
    offlineMessage: offlineMessage ?? current.offlineMessage,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.pagesConfig[slug] = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("pages_config").update({
        is_active: isActive,
        offline_message: updated.offlineMessage,
        updated_at: updated.updatedAt,
      }).eq("slug", slug);
    }
  }
  return updated;
}

// ==============================================================================
// 3. Section Configurations
// ==============================================================================

export async function getSectionConfigs(pageSlug?: string): Promise<SectionConfig[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      let query = supabase.from("section_configs").select("*").order("display_order");
      if (pageSlug) {
        query = query.eq("page_slug", pageSlug);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          pageSlug: d.page_slug,
          sectionKey: d.section_key,
          sectionName: d.section_name,
          isActive: Boolean(d.is_active),
          eyebrow: d.eyebrow,
          heading: d.heading,
          subheading: d.subheading,
          contentJson: d.content_json,
          displayOrder: d.display_order,
          updatedAt: d.updated_at,
        }));
      }
    }
  }

  let list = Object.values(memoryStore.sectionConfigs);
  if (pageSlug) {
    list = list.filter((s) => s.pageSlug.toLowerCase() === pageSlug.toLowerCase());
  }
  return list.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function toggleSectionActive(id: string, isActive: boolean): Promise<SectionConfig | null> {
  const section = memoryStore.sectionConfigs[id];
  if (!section) return null;

  const updated: SectionConfig = {
    ...section,
    isActive,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.sectionConfigs[id] = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("section_configs").update({
        is_active: isActive,
        updated_at: updated.updatedAt,
      }).eq("id", id);
    }
  }
  return updated;
}

export async function updateSectionConfig(id: string, patch: Partial<SectionConfig>): Promise<SectionConfig | null> {
  const section = memoryStore.sectionConfigs[id];
  if (!section) return null;

  const updated: SectionConfig = {
    ...section,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.sectionConfigs[id] = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("section_configs").update({
        eyebrow: updated.eyebrow,
        heading: updated.heading,
        subheading: updated.subheading,
        is_active: updated.isActive,
        updated_at: updated.updatedAt,
      }).eq("id", id);
    }
  }
  return updated;
}

// ==============================================================================
// 4. Services CRUD
// ==============================================================================

export async function getServices(activeOnly = true): Promise<ServiceItem[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      let query = supabase.from("services").select("*").order("display_order");
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          description: d.description,
          icon: d.icon,
          isActive: Boolean(d.is_active),
          displayOrder: d.display_order,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }
  }

  const list = activeOnly ? memoryStore.services.filter((s) => s.isActive) : memoryStore.services;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createService(data: Omit<ServiceItem, "id">): Promise<ServiceItem> {
  const newService: ServiceItem = {
    ...data,
    id: `srv-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryStore.services.push(newService);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("services").insert({
        slug: newService.slug,
        title: newService.title,
        description: newService.description,
        icon: newService.icon,
        is_active: newService.isActive,
        display_order: newService.displayOrder,
      });
    }
  }
  return newService;
}

export async function updateService(id: string, patch: Partial<ServiceItem>): Promise<ServiceItem | null> {
  const index = memoryStore.services.findIndex((s) => s.id === id || s.slug === id);
  if (index === -1) return null;

  const updated: ServiceItem = {
    ...memoryStore.services[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.services[index] = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("services").update({
        title: updated.title,
        description: updated.description,
        icon: updated.icon,
        slug: updated.slug,
        is_active: updated.isActive,
        display_order: updated.displayOrder,
        updated_at: updated.updatedAt,
      }).or(`id.eq.${id},slug.eq.${id}`);
    }
  }
  return updated;
}

export async function deleteService(id: string): Promise<boolean> {
  const index = memoryStore.services.findIndex((s) => s.id === id || s.slug === id);
  if (index === -1) return false;
  memoryStore.services.splice(index, 1);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("services").delete().or(`id.eq.${id},slug.eq.${id}`);
    }
  }
  return true;
}

// ==============================================================================
// 5. Projects CRUD
// ==============================================================================

export async function getProjects(activeOnly = true): Promise<ProjectItem[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      let query = supabase.from("projects").select("*").order("display_order");
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          description: d.description,
          tags: d.tags || [],
          image: d.image,
          isActive: Boolean(d.is_active),
          displayOrder: d.display_order,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }
  }

  const list = activeOnly ? memoryStore.projects.filter((p) => p.isActive) : memoryStore.projects;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createProject(data: Omit<ProjectItem, "id">): Promise<ProjectItem> {
  const newProject: ProjectItem = {
    ...data,
    id: `prj-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryStore.projects.push(newProject);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("projects").insert({
        slug: newProject.slug,
        title: newProject.title,
        description: newProject.description,
        tags: newProject.tags,
        image: newProject.image,
        is_active: newProject.isActive,
        display_order: newProject.displayOrder,
      });
    }
  }
  return newProject;
}

export async function updateProject(id: string, patch: Partial<ProjectItem>): Promise<ProjectItem | null> {
  const index = memoryStore.projects.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) return null;

  const updated: ProjectItem = {
    ...memoryStore.projects[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.projects[index] = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("projects").update({
        title: updated.title,
        description: updated.description,
        tags: updated.tags,
        image: updated.image,
        slug: updated.slug,
        is_active: updated.isActive,
        display_order: updated.displayOrder,
        updated_at: updated.updatedAt,
      }).or(`id.eq.${id},slug.eq.${id}`);
    }
  }
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const index = memoryStore.projects.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) return false;
  memoryStore.projects.splice(index, 1);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("projects").delete().or(`id.eq.${id},slug.eq.${id}`);
    }
  }
  return true;
}

// ==============================================================================
// 6. Leadership Team CRUD
// ==============================================================================

export async function getTeamMembers(activeOnly = true): Promise<TeamMemberItem[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      let query = supabase.from("team_members").select("*").order("display_order");
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          role: d.role,
          image: d.image,
          linkedin: d.linkedin,
          isActive: Boolean(d.is_active),
          displayOrder: d.display_order,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }
  }

  const list = activeOnly ? memoryStore.teamMembers.filter((m) => m.isActive) : memoryStore.teamMembers;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createTeamMember(data: Omit<TeamMemberItem, "id">): Promise<TeamMemberItem> {
  const newMember: TeamMemberItem = {
    ...data,
    id: `tm-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryStore.teamMembers.push(newMember);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("team_members").insert({
        name: newMember.name,
        role: newMember.role,
        image: newMember.image,
        linkedin: newMember.linkedin,
        is_active: newMember.isActive,
        display_order: newMember.displayOrder,
      });
    }
  }
  return newMember;
}

export async function updateTeamMember(id: string, patch: Partial<TeamMemberItem>): Promise<TeamMemberItem | null> {
  const index = memoryStore.teamMembers.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const updated: TeamMemberItem = {
    ...memoryStore.teamMembers[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.teamMembers[index] = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("team_members").update({
        name: updated.name,
        role: updated.role,
        image: updated.image,
        linkedin: updated.linkedin,
        is_active: updated.isActive,
        display_order: updated.displayOrder,
        updated_at: updated.updatedAt,
      }).eq("id", id);
    }
  }
  return updated;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const index = memoryStore.teamMembers.findIndex((m) => m.id === id);
  if (index === -1) return false;
  memoryStore.teamMembers.splice(index, 1);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("team_members").delete().eq("id", id);
    }
  }
  return true;
}

// ==============================================================================
// 7. Blog Posts CRUD
// ==============================================================================

export async function getBlogPosts(publishedOnly = true): Promise<BlogPostItem[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      let query = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (publishedOnly) {
        query = query.eq("is_published", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          excerpt: d.excerpt,
          content: d.content,
          author: d.author,
          date: d.date,
          tags: d.tags || [],
          coverImage: d.cover_image,
          isPublished: Boolean(d.is_published),
          isFeatured: Boolean(d.is_featured),
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }
  }

  return publishedOnly ? memoryStore.blogPosts.filter((p) => p.isPublished) : memoryStore.blogPosts;
}

export async function createBlogPost(data: Omit<BlogPostItem, "id">): Promise<BlogPostItem> {
  const newPost: BlogPostItem = {
    ...data,
    id: `post-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryStore.blogPosts.unshift(newPost);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("blog_posts").insert({
        slug: newPost.slug,
        title: newPost.title,
        excerpt: newPost.excerpt,
        content: newPost.content,
        author: newPost.author,
        date: newPost.date,
        tags: newPost.tags,
        cover_image: newPost.coverImage,
        is_published: newPost.isPublished,
        is_featured: newPost.isFeatured,
      });
    }
  }
  return newPost;
}

export async function updateBlogPost(id: string, patch: Partial<BlogPostItem>): Promise<BlogPostItem | null> {
  const index = memoryStore.blogPosts.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) return null;

  const updated: BlogPostItem = {
    ...memoryStore.blogPosts[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.blogPosts[index] = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("blog_posts").update({
        title: updated.title,
        excerpt: updated.excerpt,
        content: updated.content,
        author: updated.author,
        date: updated.date,
        tags: updated.tags,
        cover_image: updated.coverImage,
        is_published: updated.isPublished,
        is_featured: updated.isFeatured,
        slug: updated.slug,
        updated_at: updated.updatedAt,
      }).or(`id.eq.${id},slug.eq.${id}`);
    }
  }
  return updated;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const index = memoryStore.blogPosts.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) return false;
  memoryStore.blogPosts.splice(index, 1);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("blog_posts").delete().or(`id.eq.${id},slug.eq.${id}`);
    }
  }
  return true;
}

// ==============================================================================
// 8. FAQs CRUD
// ==============================================================================

export async function getFaqs(activeOnly = true): Promise<FaqItemCMS[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      let query = supabase.from("faqs").select("*").order("display_order");
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          question: d.question,
          answer: d.answer,
          isActive: Boolean(d.is_active),
          displayOrder: d.display_order,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }
  }

  const list = activeOnly ? memoryStore.faqs.filter((f) => f.isActive) : memoryStore.faqs;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createFaq(data: Omit<FaqItemCMS, "id">): Promise<FaqItemCMS> {
  const newFaq: FaqItemCMS = {
    ...data,
    id: `faq-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryStore.faqs.push(newFaq);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("faqs").insert({
        question: newFaq.question,
        answer: newFaq.answer,
        is_active: newFaq.isActive,
        display_order: newFaq.displayOrder,
      });
    }
  }
  return newFaq;
}

export async function updateFaq(id: string, patch: Partial<FaqItemCMS>): Promise<FaqItemCMS | null> {
  const index = memoryStore.faqs.findIndex((f) => f.id === id);
  if (index === -1) return null;

  const updated: FaqItemCMS = {
    ...memoryStore.faqs[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.faqs[index] = updated;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("faqs").update({
        question: updated.question,
        answer: updated.answer,
        is_active: updated.isActive,
        display_order: updated.displayOrder,
        updated_at: updated.updatedAt,
      }).eq("id", id);
    }
  }
  return updated;
}

export async function deleteFaq(id: string): Promise<boolean> {
  const index = memoryStore.faqs.findIndex((f) => f.id === id);
  if (index === -1) return false;
  memoryStore.faqs.splice(index, 1);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("faqs").delete().eq("id", id);
    }
  }
  return true;
}

// ==============================================================================
// 9. Client Contact Inquiries Inbox
// ==============================================================================

export async function getInquiries(): Promise<ContactInquiry[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data, error } = await supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          company: d.company,
          message: d.message,
          status: d.status,
          createdAt: d.created_at,
          ipAddress: d.ip_address,
        }));
      }
    }
  }

  return [...memoryStore.contactInquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function submitInquiry(data: {
  name: string;
  email: string;
  company?: string;
  message: string;
  ipAddress?: string;
}): Promise<ContactInquiry> {
  const newInquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    name: data.name,
    email: data.email,
    company: data.company,
    message: data.message,
    status: "new",
    ipAddress: data.ipAddress,
    createdAt: new Date().toISOString(),
  };
  memoryStore.contactInquiries.unshift(newInquiry);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("contact_inquiries").insert({
        name: newInquiry.name,
        email: newInquiry.email,
        company: newInquiry.company,
        message: newInquiry.message,
        status: newInquiry.status,
        ip_address: newInquiry.ipAddress,
      });
    }
  }
  return newInquiry;
}

export async function updateInquiryStatus(id: string, status: ContactInquiry["status"]): Promise<ContactInquiry | null> {
  const inquiry = memoryStore.contactInquiries.find((i) => i.id === id);
  if (!inquiry) return null;
  inquiry.status = status;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.from("contact_inquiries").update({ status }).eq("id", id);
    }
  }
  return inquiry;
}

// ==============================================================================
// 10. Supporting Content Queries (Milestones, Values, Cases, Metrics, Featured)
// ==============================================================================

export async function getTimelineMilestones(activeOnly = true): Promise<TimelineMilestoneCMS[]> {
  const list = activeOnly ? memoryStore.timelineMilestones.filter((m) => m.isActive) : memoryStore.timelineMilestones;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getCoreValues(activeOnly = true): Promise<CoreValueCMS[]> {
  const list = activeOnly ? memoryStore.coreValues.filter((v) => v.isActive) : memoryStore.coreValues;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getServiceCases(activeOnly = true): Promise<ServiceCaseCMS[]> {
  const list = activeOnly ? memoryStore.serviceCases.filter((c) => c.isActive) : memoryStore.serviceCases;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getWorkResults(activeOnly = true): Promise<WorkResultCMS[]> {
  const list = activeOnly ? memoryStore.workResults.filter((r) => r.isActive) : memoryStore.workResults;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getKeyMetrics(context: "home" | "about", activeOnly = true): Promise<KeyMetricCMS[]> {
  let list = memoryStore.keyMetrics.filter((m) => m.context === context);
  if (activeOnly) {
    list = list.filter((m) => m.isActive);
  }
  return list.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getFeaturedCaseStudy(): Promise<FeaturedCaseStudyCMS> {
  return memoryStore.featuredCaseStudy;
}

export async function updateFeaturedCaseStudy(patch: Partial<FeaturedCaseStudyCMS>): Promise<FeaturedCaseStudyCMS> {
  memoryStore.featuredCaseStudy = {
    ...memoryStore.featuredCaseStudy,
    ...patch,
  };
  return memoryStore.featuredCaseStudy;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return memoryStore.adminUsers;
}
