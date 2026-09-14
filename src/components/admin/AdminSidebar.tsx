"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Briefcase,
  FolderGit2,
  Users,
  BookOpen,
  HelpCircle,
  Inbox,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from "lucide-react";
import type { AdminRole, AdminUser } from "@/types/cms";
import { hasPermission } from "@/lib/auth/permissions";

interface AdminSidebarProps {
  user: AdminUser;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  }

  const roleColors: Record<AdminRole, { bg: string; text: string; label: string }> = {
    super_admin: { bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-400", label: "Super Admin" },
    content_admin: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", label: "Content Admin" },
    editor: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", label: "Staff Editor" },
    viewer: { bg: "bg-slate-500/10 border-slate-500/30", text: "text-slate-400", label: "Read-only Viewer" },
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: "Pages & Sections",
      href: "/admin/pages-sections",
      icon: Layers,
      show: hasPermission(user.roleId, "pages:manage") || hasPermission(user.roleId, "sections:manage"),
    },
    {
      label: "Services",
      href: "/admin/services",
      icon: Briefcase,
      show: hasPermission(user.roleId, "services:manage"),
    },
    {
      label: "Portfolio Projects",
      href: "/admin/projects",
      icon: FolderGit2,
      show: hasPermission(user.roleId, "projects:manage"),
    },
    {
      label: "Leadership Team",
      href: "/admin/team",
      icon: Users,
      show: hasPermission(user.roleId, "team:manage"),
    },
    {
      label: "Blog & Insights",
      href: "/admin/blog",
      icon: BookOpen,
      show: hasPermission(user.roleId, "blog:manage"),
    },
    {
      label: "Common FAQs",
      href: "/admin/faqs",
      icon: HelpCircle,
      show: hasPermission(user.roleId, "faqs:manage"),
    },
    {
      label: "Inquiries Inbox",
      href: "/admin/inquiries",
      icon: Inbox,
      show: hasPermission(user.roleId, "inquiries:read"),
    },
    {
      label: "Site & Maintenance",
      href: "/admin/settings",
      icon: Settings,
      show: hasPermission(user.roleId, "settings:manage") || hasPermission(user.roleId, "maintenance:manage"),
    },
    {
      label: "Users & Permissions",
      href: "/admin/users",
      icon: ShieldCheck,
      show: hasPermission(user.roleId, "users:manage"),
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 bg-slate-950 text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
              C
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">Catalyst CMS</p>
              <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">Admin Panel</p>
            </div>
          </Link>
          <Link
            href="/"
            target="_blank"
            title="Open Live Website"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* Navigation Items (Permission-Filtered) */}
        <div className="p-3">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Content & Controls
          </p>
          <nav className="space-y-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user.fullName}</p>
            <p className="truncate text-[11px] text-slate-400">{user.email}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  roleColors[user.roleId]?.bg || "bg-slate-800 border-slate-700"
                } ${roleColors[user.roleId]?.text || "text-slate-300"}`}
              >
                {roleColors[user.roleId]?.label || user.roleId}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
