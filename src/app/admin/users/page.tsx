"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  Info,
  ChevronRight,
} from "lucide-react";
import { PERMISSIONS, ROLES, searchPermissions } from "@/lib/auth/permissions";
import type { AdminRole, PermissionId } from "@/types/cms";

const ADMIN_USERS_LIST = [
  {
    id: "user-1",
    name: "Eleanor Vance",
    email: "superadmin@catalystdigital.com",
    role: "super_admin" as AdminRole,
    title: "Chief Technology Officer & Lead Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    status: "active",
  },
  {
    id: "user-2",
    name: "Marcus Sterling",
    email: "content@catalystdigital.com",
    role: "content_admin" as AdminRole,
    title: "Head of Marketing & Editorial",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    status: "active",
  },
  {
    id: "user-3",
    name: "Sophia Chen",
    email: "editor@catalystdigital.com",
    role: "editor" as AdminRole,
    title: "Senior Content Producer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    status: "active",
  },
  {
    id: "user-4",
    name: "David Kim",
    email: "auditor@catalystdigital.com",
    role: "viewer" as AdminRole,
    title: "Compliance & Security Auditor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    status: "active",
  },
];

export default function UsersPermissionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<AdminRole | "all">("all");
  const [inspectedPermission, setInspectedPermission] = useState<PermissionId | null>("maintenance:manage");

  const roleColors: Record<AdminRole, { bg: string; text: string; label: string; border: string }> = {
    super_admin: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/30",
      label: "Super Admin",
    },
    content_admin: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/30",
      label: "Content Admin",
    },
    editor: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      label: "Staff Editor",
    },
    viewer: {
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      border: "border-slate-500/30",
      label: "Auditor / Viewer",
    },
  };

  // Filter permissions dynamically using search Permissions helper
  const rawResults = searchPermissions(searchQuery);
  const filteredPermissions = rawResults.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    if (!matchesCategory) return false;

    if (selectedRoleFilter !== "all") {
      return ROLES[selectedRoleFilter].permissions.includes(p.id);
    }
    return true;
  });

  const activeInspected = PERMISSIONS.find((p) => p.id === inspectedPermission);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
          Access Control, Administrators & Permission Search Tool
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Audit administrative credentials, explore role-based permissions (RBAC), and search granular capabilities in real-time.
        </p>
      </div>

      {/* Administrators Roster */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <Users className="h-5 w-5 text-indigo-400" />
              Administrative Users & Assigned Roles
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Users authorized to authenticate into the Catalyst Digital CMS backend.
            </p>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {ADMIN_USERS_LIST.length} Authorized Admins
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_USERS_LIST.map((admin) => {
            const roleBadge = roleColors[admin.role];
            return (
              <div
                key={admin.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      loading="lazy"
                      className="h-11 w-11 rounded-full border border-slate-700 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white truncate">{admin.name}</h3>
                      <p className="text-[11px] text-slate-400 truncate">{admin.title}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-[11px] font-mono text-slate-400 truncate">{admin.email}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}
                  >
                    {roleBadge.label}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission Search Tool & Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Key className="h-5 w-5 text-indigo-400" />
              Interactive Permission Search & Policy Inspector
            </h2>
            <p className="text-xs text-slate-400">
              Query all 12 platform capabilities by keyword, filter by domain, or evaluate RBAC coverage across roles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-400">
              {filteredPermissions.length} of {PERMISSIONS.length} Permissions
            </span>
          </div>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
            <input
              type="text"
              placeholder="Search capability by keyword (e.g. maintenance, services, pages, inquiries, settings)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
              {(["all", "System", "Content", "Communication", "Security"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Role Filter */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value as AdminRole | "all")}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Filter: All Roles</option>
              <option value="super_admin">Role: Super Admin</option>
              <option value="content_admin">Role: Content Admin</option>
              <option value="editor">Role: Staff Editor</option>
              <option value="viewer">Role: Viewer</option>
            </select>
          </div>
        </div>

        {/* Matrix Table & Inspector Layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Permission List / Matrix */}
          <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Permission Key & Capability</th>
                  <th className="px-3 py-3 text-center">Category</th>
                  <th className="px-2 py-3 text-center" title="Super Administrator">Super</th>
                  <th className="px-2 py-3 text-center" title="Content Administrator">Content</th>
                  <th className="px-2 py-3 text-center" title="Staff Editor">Editor</th>
                  <th className="px-2 py-3 text-center" title="Auditor / Viewer">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No permissions match your search query &ldquo;{searchQuery}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((perm) => {
                    const isSelected = inspectedPermission === perm.id;

                    return (
                      <tr
                        key={perm.id}
                        onClick={() => setInspectedPermission(perm.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-indigo-950/30" : "hover:bg-slate-900/50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-400 font-semibold">{perm.id}</span>
                            {isSelected && <ChevronRight className="h-3 w-3 text-indigo-400" />}
                          </div>
                          <p className="mt-0.5 text-slate-200 font-medium">{perm.name}</p>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                            {perm.category}
                          </span>
                        </td>

                        {/* Roles Checkmarks */}
                        {(["super_admin", "content_admin", "editor", "viewer"] as AdminRole[]).map((r) => {
                          const has = ROLES[r].permissions.includes(perm.id);
                          return (
                            <td key={r} className="px-2 py-3 text-center">
                              {has ? (
                                <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />
                              ) : (
                                <XCircle className="mx-auto h-4 w-4 text-slate-700" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Capability Detail Inspector Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 flex flex-col justify-between">
            {activeInspected ? (
              <div>
                <div className="flex items-center gap-2 text-indigo-400">
                  <Lock className="h-4 w-4" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                    Capability Inspector
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-white">{activeInspected.name}</h3>
                <p className="mt-0.5 font-mono text-xs text-indigo-400">{activeInspected.id}</p>

                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs leading-relaxed text-slate-300">
                  {activeInspected.description}
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Roles Granted this Authority:
                  </h4>
                  <div className="mt-2 space-y-2">
                    {(["super_admin", "content_admin", "editor", "viewer"] as AdminRole[]).map((r) => {
                      const has = ROLES[r].permissions.includes(activeInspected.id);
                      const badge = roleColors[r];
                      return (
                        <div
                          key={r}
                          className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                            has
                              ? `${badge.bg} ${badge.border} ${badge.text}`
                              : "border-slate-800/60 bg-slate-900/30 text-slate-600"
                          }`}
                        >
                          <span className="font-semibold">{badge.label}</span>
                          {has ? (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Granted
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-600">Restricted</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                <Info className="h-8 w-8 text-slate-600" />
                <p className="mt-2 text-xs">Select any permission row to inspect its role authorization rules.</p>
              </div>
            )}

            <div className="mt-6 border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
              Enforced server-side via Next.js 16 Proxy and RBAC middleware on all mutation endpoints.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
