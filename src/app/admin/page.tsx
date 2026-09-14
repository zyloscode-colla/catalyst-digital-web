import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getBlogPosts,
  getFaqs,
  getInquiries,
  getPagesConfig,
  getProjects,
  getSectionConfigs,
  getServices,
  getSiteSettings,
  getTeamMembers,
} from "@/lib/cms/service";
import { hasPermission } from "@/lib/auth/permissions";
import {
  Briefcase,
  FolderGit2,
  Users,
  BookOpen,
  Inbox,
  ShieldAlert,
  ArrowRight,
  Plus,
  Layers,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [settings, pages, sections, services, projects, team, blogPosts, faqs, inquiries] =
    await Promise.all([
      getSiteSettings(),
      getPagesConfig(),
      getSectionConfigs(),
      getServices(false),
      getProjects(false),
      getTeamMembers(false),
      getBlogPosts(false),
      getFaqs(false),
      getInquiries(),
    ]);

  const activePagesCount = pages.filter((p) => p.isActive).length;
  const activeSectionsCount = sections.filter((s) => s.isActive).length;
  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, {user.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Platform control center & dynamic content overview for Catalyst Digital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasPermission(user.roleId, "services:manage") && (
            <Link
              href="/admin/services"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Service
            </Link>
          )}
          {hasPermission(user.roleId, "projects:manage") && (
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Project
            </Link>
          )}
        </div>
      </div>

      {/* Maintenance Mode Warning if active */}
      {settings.maintenanceMode && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-200">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300">Public Maintenance Mode is ACTIVE</p>
              <p className="text-xs text-amber-400/80">
                Visitors are held on the maintenance screen. Authenticated admins can browse normally.
              </p>
            </div>
          </div>
          {hasPermission(user.roleId, "maintenance:manage") && (
            <Link
              href="/admin/settings"
              className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-3.5 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors"
            >
              Configure / Disable
            </Link>
          )}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/pages-sections"
          className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pages Active</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {activePagesCount} <span className="text-sm font-normal text-slate-500">/ {pages.length}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{activeSectionsCount} sections currently enabled</p>
        </Link>

        <Link
          href="/admin/services"
          className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Services</span>
            <Briefcase className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{services.length}</p>
          <p className="mt-1 text-xs text-slate-500">{services.filter((s) => s.isActive).length} active in public catalog</p>
        </Link>

        <Link
          href="/admin/projects"
          className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            <FolderGit2 className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{projects.length}</p>
          <p className="mt-1 text-xs text-slate-500">{projects.filter((p) => p.isActive).length} published case studies</p>
        </Link>

        <Link
          href="/admin/inquiries"
          className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">New Inquiries</span>
            <Inbox className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{newInquiriesCount}</p>
          <p className="mt-1 text-xs text-slate-500">{inquiries.length} total submissions</p>
        </Link>

        <Link
          href="/admin/team"
          className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Team Roster</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{team.length}</p>
          <p className="mt-1 text-xs text-slate-500">{team.filter((t) => t.isActive).length} active members</p>
        </Link>

        <Link
          href="/admin/blog"
          className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Blog Articles</span>
            <BookOpen className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{blogPosts.length}</p>
          <p className="mt-1 text-xs text-slate-500">{blogPosts.filter((b) => b.isPublished).length} published</p>
        </Link>

        <Link
          href="/admin/faqs"
          className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">FAQs</span>
            <HelpCircle className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{faqs.length}</p>
          <p className="mt-1 text-xs text-slate-500">{faqs.filter((f) => f.isActive).length} active</p>
        </Link>
      </div>

      {/* Two Column Layout: Page Statuses + Recent Inquiries */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Public Pages Status Manager Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Public Pages Status</h2>
            <Link
              href="/admin/pages-sections"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              Manage Toggles <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Turn individual pages on or off instantly across the public router.
          </p>

          <div className="mt-5 divide-y divide-slate-800/80">
            {pages.map((p) => (
              <div key={p.slug} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {p.isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{p.title}</p>
                    <p className="text-xs text-slate-500">/{p.slug === "home" ? "" : p.slug}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {p.isActive ? "Online" : "Turned Off"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contact Inquiries */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Client Inquiries</h2>
            <Link
              href="/admin/inquiries"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              View All ({inquiries.length}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="mt-1 text-xs text-slate-400">Latest submissions captured through the Contact Form.</p>

          <div className="mt-5 space-y-3">
            {inquiries.slice(0, 3).map((inq) => (
              <div
                key={inq.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{inq.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      inq.status === "new"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>
                <p className="text-xs text-indigo-400 mt-0.5">{inq.email}</p>
                <p className="mt-2 text-xs text-slate-400 line-clamp-2">{inq.message}</p>
              </div>
            ))}

            {inquiries.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-500">No client inquiries received yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
