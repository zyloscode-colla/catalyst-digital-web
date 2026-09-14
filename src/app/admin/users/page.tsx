"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  Save,
  ShieldAlert,
  Cookie,
  Laptop,
  LogOut,
  RefreshCw,
  KeyRound,
  Fingerprint,
} from "lucide-react";
import type { AdminRole, AdminUser, Permission, Role } from "@/types/cms";
import {
  PERMISSIONS as DEFAULT_PERMISSIONS,
  ROLES as DEFAULT_ROLES,
  ROLE_HIERARCHY,
  canManageUser,
  canAssignRole,
  canManagePermissionsMatrix,
} from "@/lib/auth/permissions";

const ROLE_CONFIG: Record<
  AdminRole,
  { bg: string; text: string; label: string; border: string; desc: string }
> = {
  super_admin: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    label: "Super Admin",
    desc: "Unrestricted authority across settings, users, and content",
  },
  content_admin: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    label: "Content Admin",
    desc: "Authority to manage content, inquiries, and section toggles",
  },
  editor: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    label: "Staff Editor",
    desc: "Manage services, portfolio projects, team members, and articles",
  },
  viewer: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
    label: "Auditor / Viewer",
    desc: "Read-only access for compliance, auditing, and lead inspection",
  },
};

interface SessionItem {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  roleId: AdminRole;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

interface CookieSecurityMeta {
  httpOnly: boolean;
  sameSite: string;
  secure: boolean;
  maxAgeDays: number;
  validation: string;
}

export default function UsersPermissionsManager() {
  const [activeTab, setActiveTab] = useState<"users" | "permissions" | "sessions">("users");

  // Current authenticated user session
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);
  const [rolePermissions, setRolePermissions] = useState<Record<AdminRole, string[]>>({
    super_admin: DEFAULT_ROLES.super_admin.permissions,
    content_admin: DEFAULT_ROLES.content_admin.permissions,
    editor: DEFAULT_ROLES.editor.permissions,
    viewer: DEFAULT_ROLES.viewer.permissions,
  });

  // Sessions state
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [cookieMeta, setCookieMeta] = useState<CookieSecurityMeta | null>(null);
  const [cookieName, setCookieName] = useState<string>("catalyst_cms_session");

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [inspectedPermissionId, setInspectedPermissionId] = useState<string | null>("maintenance:manage");

  // User Modals State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    fullName: "",
    email: "",
    roleId: "editor" as AdminRole,
    password: "",
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userDeleteTarget, setUserDeleteTarget] = useState<AdminUser | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Permission Modals State
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [permFormData, setPermFormData] = useState({
    id: "",
    name: "",
    category: "System",
    description: "",
  });
  const [permDeleteTarget, setPermDeleteTarget] = useState<Permission | null>(null);
  const [isSubmittingPerm, setIsSubmittingPerm] = useState(false);

  // Role Matrix Save state
  const [hasUnsavedRoleChanges, setHasUnsavedRoleChanges] = useState(false);
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  // Session Revocation state
  const [isRevokingSession, setIsRevokingSession] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const [authRes, usersRes, permsRes, sessionsRes] = await Promise.all([
        fetch("/api/admin/auth"),
        fetch("/api/admin/cms?entity=users"),
        fetch("/api/admin/cms?entity=permissions"),
        fetch("/api/admin/cms?entity=sessions"),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData?.user) setCurrentUser(authData.user);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) setUsers(usersData);
      }

      if (permsRes.ok) {
        const pData = await permsRes.json();
        if (Array.isArray(pData?.permissions) && pData.permissions.length > 0) {
          setPermissions(pData.permissions);
        }
        if (Array.isArray(pData?.roles)) {
          const map: Record<AdminRole, string[]> = {
            super_admin: [],
            content_admin: [],
            editor: [],
            viewer: [],
          };
          pData.roles.forEach((r: Role) => {
            if (map[r.id as AdminRole]) {
              map[r.id as AdminRole] = r.permissions;
            }
          });
          setRolePermissions(map);
        }
      }

      if (sessionsRes.ok) {
        const sData = await sessionsRes.json();
        if (Array.isArray(sData?.sessions)) setSessions(sData.sessions);
        if (sData?.security) setCookieMeta(sData.security);
        if (sData?.cookieName) setCookieName(sData.cookieName);
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to load administrators, permissions, or session security data");
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  }

  const isSuperAdmin = currentUser?.roleId === "super_admin";

  // ============================================================================
  // User Actions (Create, Edit, Toggle, Delete) with Hierarchical Enforcement
  // ============================================================================

  function openCreateUserModal() {
    // Default to the highest role this user can assign
    const availableRoles = (["viewer", "editor", "content_admin", "super_admin"] as AdminRole[]).filter(
      (r) => currentUser && canAssignRole(currentUser.roleId, r)
    );

    const defaultRole = availableRoles[availableRoles.length - 1] || "editor";

    setEditingUser(null);
    setUserFormData({
      fullName: "",
      email: "",
      roleId: defaultRole,
      password: "",
      isActive: true,
    });
    setShowPassword(false);
    setUserModalOpen(true);
  }

  function openEditUserModal(user: AdminUser) {
    const isSelf = currentUser?.id === user.id;

    // Hierarchy check: non-super admin cannot edit equal or higher rank
    if (!isSelf && currentUser && !canManageUser(currentUser.roleId, user.roleId, false)) {
      showFeedback(
        "error",
        `Hierarchical Privilege Lock: You cannot modify an administrator of equal or higher rank (${ROLE_CONFIG[user.roleId]?.label}).`
      );
      return;
    }

    setEditingUser(user);
    setUserFormData({
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      password: "",
      isActive: user.isActive,
    });
    setShowPassword(false);
    setUserModalOpen(true);
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!userFormData.fullName.trim() || !userFormData.email.trim()) {
      showFeedback("error", "Full name and email address are required.");
      return;
    }

    const isEdit = Boolean(editingUser);
    const isSelf = currentUser?.id === editingUser?.id;

    // Self-privilege check
    if (isEdit && isSelf && userFormData.roleId !== currentUser?.roleId) {
      showFeedback("error", "Self-Privilege Guard: You cannot modify your own administrative role tier.");
      return;
    }

    if (isEdit && isSelf && !userFormData.isActive) {
      showFeedback("error", "Self-Lockout Guard: You cannot deactivate your own account.");
      return;
    }

    if (!isEdit && (!userFormData.password || userFormData.password.length < 6)) {
      showFeedback("error", "Initial password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmittingUser(true);
      const action = isEdit ? "update" : "create";
      const payloadData = isEdit
        ? {
            id: editingUser!.id,
            fullName: userFormData.fullName,
            email: userFormData.email,
            roleId: isSelf ? currentUser?.roleId : userFormData.roleId,
            isActive: isSelf ? true : userFormData.isActive,
            newPassword: userFormData.password ? userFormData.password : undefined,
          }
        : {
            fullName: userFormData.fullName,
            email: userFormData.email,
            roleId: userFormData.roleId,
            password: userFormData.password,
            isActive: userFormData.isActive,
          };

      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "users", action, data: payloadData }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to save administrator account");
      }

      showFeedback(
        "success",
        isEdit
          ? `Administrator ${userFormData.fullName} updated successfully.`
          : `Administrator ${userFormData.fullName} created successfully.`
      );
      setUserModalOpen(false);
      await fetchInitialData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving administrator";
      showFeedback("error", msg);
    } finally {
      setIsSubmittingUser(false);
    }
  }

  async function handleToggleUserActive(target: AdminUser) {
    if (currentUser?.id === target.id) {
      showFeedback("error", "Self-Lockout Guard: You cannot deactivate your own administrative account.");
      return;
    }

    if (currentUser && !canManageUser(currentUser.roleId, target.roleId, false)) {
      showFeedback(
        "error",
        `Hierarchical Privilege Lock: You cannot toggle the status of an administrator of equal or higher rank.`
      );
      return;
    }

    try {
      const newStatus = !target.isActive;
      // Optimistic update
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, isActive: newStatus } : u)));

      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "users",
          action: "toggleActive",
          data: { id: target.id, isActive: newStatus },
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to toggle status");
      }

      showFeedback("success", `Updated ${target.fullName} status to ${newStatus ? "Active" : "Inactive"}`);
    } catch (err: unknown) {
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, isActive: target.isActive } : u)));
      const msg = err instanceof Error ? err.message : "Failed to toggle status";
      showFeedback("error", msg);
    }
  }

  async function handleDeleteUser() {
    if (!userDeleteTarget) return;

    if (currentUser?.id === userDeleteTarget.id) {
      showFeedback("error", "Self-Deletion Guard: You cannot delete your own account.");
      return;
    }

    if (currentUser && !canManageUser(currentUser.roleId, userDeleteTarget.roleId, false)) {
      showFeedback(
        "error",
        `Hierarchical Privilege Lock: You cannot delete an administrator of equal or higher rank.`
      );
      return;
    }

    try {
      setIsSubmittingUser(true);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "users",
          action: "delete",
          data: { id: userDeleteTarget.id },
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to delete administrator");
      }

      showFeedback("success", `Administrator ${userDeleteTarget.fullName} deleted successfully.`);
      setUserDeleteTarget(null);
      await fetchInitialData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete administrator";
      showFeedback("error", msg);
    } finally {
      setIsSubmittingUser(false);
    }
  }

  // ============================================================================
  // Permission Actions (Super Admin Exclusive)
  // ============================================================================

  function openCreatePermModal() {
    if (!isSuperAdmin) {
      showFeedback("error", "Privilege Lock: Only Super Administrators can define new capabilities.");
      return;
    }
    setEditingPerm(null);
    setPermFormData({
      id: "",
      name: "",
      category: "System",
      description: "",
    });
    setPermModalOpen(true);
  }

  function openEditPermModal(perm: Permission) {
    if (!isSuperAdmin) {
      showFeedback("error", "Privilege Lock: Only Super Administrators can edit permission capability definitions.");
      return;
    }
    setEditingPerm(perm);
    setPermFormData({
      id: perm.id,
      name: perm.name,
      category: perm.category,
      description: perm.description,
    });
    setPermModalOpen(true);
  }

  async function handleSavePermission(e: React.FormEvent) {
    e.preventDefault();
    if (!isSuperAdmin) {
      showFeedback("error", "Privilege Lock: Only Super Administrators can alter permissions.");
      return;
    }

    if (!permFormData.name.trim()) {
      showFeedback("error", "Permission capability name is required");
      return;
    }

    try {
      setIsSubmittingPerm(true);
      const isEdit = Boolean(editingPerm);
      const action = isEdit ? "update" : "create";
      const payloadData = isEdit
        ? {
            id: editingPerm!.id,
            name: permFormData.name,
            category: permFormData.category,
            description: permFormData.description,
          }
        : {
            id: permFormData.id.toLowerCase().replace(/[^a-z0-9_:]/g, ""),
            name: permFormData.name,
            category: permFormData.category,
            description: permFormData.description,
          };

      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "permissions", action, data: payloadData }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to save permission");
      }

      showFeedback(
        "success",
        isEdit
          ? `Permission ${permFormData.name} updated successfully.`
          : `Capability ${permFormData.id} created and registered successfully.`
      );
      setPermModalOpen(false);
      await fetchInitialData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving permission";
      showFeedback("error", msg);
    } finally {
      setIsSubmittingPerm(false);
    }
  }

  async function handleDeletePermission() {
    if (!permDeleteTarget || !isSuperAdmin) return;

    try {
      setIsSubmittingPerm(true);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "permissions",
          action: "delete",
          data: { id: permDeleteTarget.id },
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to delete permission");
      }

      showFeedback("success", `Capability ${permDeleteTarget.id} deleted successfully.`);
      setPermDeleteTarget(null);
      await fetchInitialData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete permission";
      showFeedback("error", msg);
    } finally {
      setIsSubmittingPerm(false);
    }
  }

  function handleToggleRolePermission(roleId: AdminRole, permId: string) {
    if (!isSuperAdmin) {
      showFeedback("error", "Privilege Lock: Only Super Administrators can alter role permission mappings.");
      return;
    }

    setRolePermissions((prev) => {
      const currentList = prev[roleId] || [];
      const has = currentList.includes(permId);
      const updated = has ? currentList.filter((id) => id !== permId) : [...currentList, permId];
      return {
        ...prev,
        [roleId]: updated,
      };
    });
    setHasUnsavedRoleChanges(true);
  }

  async function handleSaveRoleMappings() {
    if (!isSuperAdmin) {
      showFeedback("error", "Privilege Lock: Only Super Administrators can alter role permission mappings.");
      return;
    }

    try {
      setIsSavingRoles(true);
      const rolesToSave: AdminRole[] = ["super_admin", "content_admin", "editor", "viewer"];

      for (const roleId of rolesToSave) {
        const res = await fetch("/api/admin/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity: "permissions",
            action: "updateRolePermissions",
            data: {
              roleId,
              permissionIds: rolePermissions[roleId],
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Failed to save ${roleId} permissions`);
        }
      }

      setHasUnsavedRoleChanges(false);
      showFeedback("success", "Role permission mappings saved to Supabase PostgreSQL successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save role mappings";
      showFeedback("error", msg);
    } finally {
      setIsSavingRoles(false);
    }
  }

  // ============================================================================
  // Session & Cookie Governance Actions
  // ============================================================================

  async function handleRevokeSession(sessionId: string) {
    try {
      setIsRevokingSession(true);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "sessions",
          action: "revoke",
          data: { sessionId },
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to revoke session");
      }

      showFeedback("success", "Session terminated immediately. Cookie invalidated.");
      await fetchInitialData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke session";
      showFeedback("error", msg);
    } finally {
      setIsRevokingSession(false);
    }
  }

  async function handleRevokeAllOtherSessions() {
    try {
      setIsRevokingSession(true);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "sessions",
          action: "revokeAllOther",
          data: {},
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to terminate sessions");
      }

      showFeedback("success", resJson.message || "All other active sessions have been terminated.");
      await fetchInitialData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to terminate other sessions";
      showFeedback("error", msg);
    } finally {
      setIsRevokingSession(false);
    }
  }

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.roleId.includes(q);
  });

  const categories = ["all", ...Array.from(new Set(permissions.map((p) => p.category)))];

  const filteredPermissions = permissions.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    if (!matchesCategory) return false;

    if (!permSearch.trim()) return true;
    const q = permSearch.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const activeInspected = permissions.find((p) => p.id === inspectedPermissionId);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            Access Control, Users & Security Governance
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Hierarchical role enforcement, live Supabase synchronization, and active cookie session monitoring.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          {activeTab === "users" && (
            <button
              onClick={openCreateUserModal}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Administrator
            </button>
          )}

          {activeTab === "permissions" && (
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <button
                  onClick={openCreatePermModal}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  <Plus className="h-4 w-4 text-indigo-400" />
                  Add Permission Key
                </button>
              )}
              {hasUnsavedRoleChanges && isSuperAdmin && (
                <button
                  onClick={handleSaveRoleMappings}
                  disabled={isSavingRoles}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 animate-pulse"
                >
                  {isSavingRoles ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Role Mappings
                </button>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="flex items-center gap-2">
              <button
                onClick={fetchInitialData}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 text-indigo-400" />
                Refresh
              </button>
              <button
                onClick={handleRevokeAllOtherSessions}
                disabled={isRevokingSession}
                className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
              >
                <LogOut className="h-4 w-4" />
                Log Out Other Devices
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Three Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "users"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Users className="h-4 w-4" />
          Administrators Roster ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all relative ${
            activeTab === "permissions"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Key className="h-4 w-4" />
          Role Permissions Matrix ({permissions.length})
          {hasUnsavedRoleChanges && (
            <span className="h-2 w-2 rounded-full bg-emerald-400" title="Unsaved Changes" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "sessions"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Cookie className="h-4 w-4" />
          Cookies & Active Sessions ({sessions.length})
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: ADMINISTRATORS ROSTER & HIERARCHICAL CRUD */}
      {/* ==================================================================== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">Total Administrators</span>
              <p className="mt-1 text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">Active Accounts</span>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">Your Authority Tier</span>
              <p className="mt-1 text-sm font-bold text-purple-400">
                {currentUser ? ROLE_CONFIG[currentUser.roleId]?.label : "Super Administrator"}
                <span className="ml-1.5 text-xs text-slate-400 font-normal">
                  (Rank {currentUser ? ROLE_HIERARCHY[currentUser.roleId]?.rank : 100})
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">Current Session User</span>
              <p className="mt-1 truncate text-xs font-mono text-indigo-300">
                {currentUser?.email || "Authenticated Admin"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search administrators by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredUsers.length} of {users.length} administrators
            </span>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="mt-2 text-sm">Loading administrators...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Users className="h-10 w-10 text-slate-600" />
                <p className="mt-2 text-sm">No administrators match your search query.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Administrator</th>
                    <th className="px-6 py-4">Role & Hierarchy Rank</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created / Last Login</th>
                    <th className="px-6 py-4 text-right">Actions & Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((user) => {
                    const roleBadge = ROLE_CONFIG[user.roleId] || ROLE_CONFIG.viewer;
                    const rank = ROLE_HIERARCHY[user.roleId]?.rank || 0;
                    const isSelf = currentUser?.id === user.id;
                    const canEditThisUser = isSelf || (currentUser && canManageUser(currentUser.roleId, user.roleId, false));

                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors ${
                          isSelf ? "bg-indigo-950/20 hover:bg-indigo-950/30" : "hover:bg-slate-800/30"
                        }`}
                      >
                        {/* Name & Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 font-bold text-white text-xs">
                              {user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white">{user.fullName}</p>
                                {isSelf && (
                                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                                    You (Active Session)
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-mono text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role & Rank */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}
                            >
                              {roleBadge.label}
                            </span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                              Rank {rank}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {isSelf ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium" title="Cannot deactivate own account">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              Active (Locked)
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleUserActive(user)}
                              disabled={!canEditThisUser}
                              className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                                canEditThisUser ? "hover:opacity-80 cursor-pointer" : "opacity-40 cursor-not-allowed"
                              }`}
                              title={canEditThisUser ? "Click to toggle active state" : "Locked: Higher rank than your tier"}
                            >
                              {user.isActive ? (
                                <>
                                  <ToggleRight className="h-5 w-5 text-emerald-400" />
                                  <span className="text-emerald-400">Active</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-5 w-5 text-slate-600" />
                                  <span className="text-slate-500">Inactive</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-4 text-xs text-slate-400">
                          <div>
                            {user.lastLoginAt ? (
                              <span>Last active: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                            ) : (
                              <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => openEditUserModal(user)}
                              disabled={!canEditThisUser}
                              className={`rounded-lg border p-2 text-xs transition-colors ${
                                canEditThisUser
                                  ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                                  : "border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed"
                              }`}
                              title={
                                isSelf
                                  ? "Edit Your Profile (Role Locked)"
                                  : canEditThisUser
                                  ? "Edit Administrator"
                                  : "Protected: Cannot edit administrator of equal or higher tier"
                              }
                            >
                              {canEditThisUser ? <Edit2 className="h-4 w-4" /> : <Lock className="h-4 w-4 text-slate-600" />}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setUserDeleteTarget(user)}
                              disabled={isSelf || !canEditThisUser}
                              className={`rounded-lg border p-2 text-xs transition-colors ${
                                !isSelf && canEditThisUser
                                  ? "border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/40 hover:bg-red-500/20"
                                  : "border-slate-800 bg-slate-900/40 text-slate-700 cursor-not-allowed"
                              }`}
                              title={
                                isSelf
                                  ? "Cannot delete your own active account"
                                  : canEditThisUser
                                  ? "Delete Administrator"
                                  : "Protected: Cannot delete administrator of equal or higher tier"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ROLE PERMISSIONS MATRIX (SUPER ADMIN EXCLUSIVE EDITING) */}
      {/* ==================================================================== */}
      {activeTab === "permissions" && (
        <div className="space-y-6">
          {!isSuperAdmin && (
            <div className="flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs text-indigo-300">
              <Lock className="h-5 w-5 flex-shrink-0 text-indigo-400" />
              <div>
                <strong className="text-white">Read-Only Policy Mode:</strong> You are currently authenticated as{" "}
                <span className="font-semibold text-white">{currentUser ? ROLE_CONFIG[currentUser.roleId]?.label : "Auditor"}</span>.
                Platform-wide role capability matrix modifications are restricted exclusively to Super Administrators.
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                placeholder="Search capability by key, name, or description..."
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {permSearch && (
                <button
                  onClick={() => setPermSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Table & Inspector Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Matrix Table */}
            <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Permission Key & Capability</th>
                    <th className="px-3 py-3.5 text-center">Category</th>
                    <th className="px-2 py-3.5 text-center" title="Super Administrator (Rank 100)">
                      Super (100)
                    </th>
                    <th className="px-2 py-3.5 text-center" title="Content Administrator (Rank 75)">
                      Content (75)
                    </th>
                    <th className="px-2 py-3.5 text-center" title="Staff Editor (Rank 50)">
                      Editor (50)
                    </th>
                    <th className="px-2 py-3.5 text-center" title="Auditor / Viewer (Rank 25)">
                      Viewer (25)
                    </th>
                    {isSuperAdmin && <th className="px-3 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                        No capabilities match your query.
                      </td>
                    </tr>
                  ) : (
                    filteredPermissions.map((perm) => {
                      const isSelected = inspectedPermissionId === perm.id;

                      return (
                        <tr
                          key={perm.id}
                          className={`transition-colors ${
                            isSelected ? "bg-indigo-950/20" : "hover:bg-slate-900/50"
                          }`}
                        >
                          {/* Key & Name */}
                          <td
                            className="px-4 py-3 cursor-pointer"
                            onClick={() => setInspectedPermissionId(perm.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-indigo-400">{perm.id}</span>
                              {isSelected && <ChevronRight className="h-3 w-3 text-indigo-400" />}
                            </div>
                            <p className="mt-0.5 font-medium text-slate-200">{perm.name}</p>
                          </td>

                          {/* Category */}
                          <td className="px-3 py-3 text-center">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                              {perm.category}
                            </span>
                          </td>

                          {/* Role Checkboxes */}
                          {(["super_admin", "content_admin", "editor", "viewer"] as AdminRole[]).map((r) => {
                            const isGranted = (rolePermissions[r] || []).includes(perm.id);

                            return (
                              <td key={r} className="px-2 py-3 text-center">
                                {isSuperAdmin ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRolePermission(r, perm.id)}
                                    className="p-1 rounded transition-colors hover:bg-slate-800"
                                    title={`Click to ${isGranted ? "revoke from" : "grant to"} ${ROLE_CONFIG[r].label}`}
                                  >
                                    {isGranted ? (
                                      <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="mx-auto h-4 w-4 text-slate-700 hover:text-slate-500" />
                                    )}
                                  </button>
                                ) : (
                                  <div>
                                    {isGranted ? (
                                      <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400 opacity-60" />
                                    ) : (
                                      <XCircle className="mx-auto h-4 w-4 text-slate-800" />
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          {/* Edit / Delete Capability (Super Admin Only) */}
                          {isSuperAdmin && (
                            <td className="px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditPermModal(perm)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                                  title="Edit Capability"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setPermDeleteTarget(perm)}
                                  className="rounded p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                  title="Delete Capability"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Capability Inspector */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
              {activeInspected ? (
                <div>
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                      Policy Inspector
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
                        const has = (rolePermissions[r] || []).includes(activeInspected.id);
                        const badge = ROLE_CONFIG[r];
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
                  <p className="mt-2 text-xs">Select any capability row to inspect policy rules.</p>
                </div>
              )}

              <div className="mt-6 border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
                Synchronized with Supabase PostgreSQL tables <code className="text-slate-400">permissions</code> and{" "}
                <code className="text-slate-400">role_permissions</code>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: COOKIES & ACTIVE SESSIONS GOVERNANCE */}
      {/* ==================================================================== */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          {/* Security & Cookie Architecture Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Cookie className="h-4 w-4 text-amber-400" />
                Session Cookie Name
              </div>
              <p className="mt-2 font-mono text-sm font-bold text-white">{cookieName}</p>
              <p className="mt-1 text-[11px] text-slate-400">Next.js 16 Base64url signed payload</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Cookie Security Flags
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  HttpOnly: true
                </span>
                <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                  SameSite: Lax
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">XSS & CSRF hardened</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Fingerprint className="h-4 w-4 text-indigo-400" />
                Live Database Validation
              </div>
              <p className="mt-2 text-sm font-bold text-emerald-400">Active Query Guard</p>
              <p className="mt-1 text-[11px] text-slate-400">Validates user is_active on every request</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Laptop className="h-4 w-4 text-purple-400" />
                Tracked Active Devices
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{sessions.length}</p>
              <p className="mt-1 text-[11px] text-slate-400">Total verified active login sessions</p>
            </div>
          </div>

          {/* Active Sessions Roster Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
            <div className="border-b border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-indigo-400" />
                  Active Administrator Sessions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time active tokens. Revoking an administrator session forces immediate re-authentication.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                {sessions.length} Device Sessions
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <Laptop className="h-8 w-8 text-slate-600" />
                <p className="mt-2 text-xs">No active sessions tracked.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-3.5">Session User</th>
                    <th className="px-6 py-3.5">Authority Tier</th>
                    <th className="px-6 py-3.5">IP Address & Device</th>
                    <th className="px-6 py-3.5">Session Age & Expiration</th>
                    <th className="px-6 py-3.5 text-right">Revocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sessions.map((sess) => {
                    const roleBadge = ROLE_CONFIG[sess.roleId] || ROLE_CONFIG.viewer;

                    return (
                      <tr key={sess.id} className="transition-colors hover:bg-slate-850">
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{sess.fullName}</span>
                            {sess.isCurrent && (
                              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                                This Device
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-slate-400">{sess.email}</p>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}
                          >
                            {roleBadge.label}
                          </span>
                        </td>

                        {/* IP & Device */}
                        <td className="px-6 py-4">
                          <p className="font-mono text-white">{sess.ipAddress}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{sess.userAgent}</p>
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-4 text-slate-400">
                          <div>Active: {new Date(sess.lastActiveAt).toLocaleTimeString()}</div>
                          <div className="text-[11px] text-slate-500">
                            Expires: {new Date(sess.expiresAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRevokeSession(sess.id)}
                            disabled={isRevokingSession}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT ADMINISTRATOR (WITH HIERARCHICAL GUARDS) */}
      {/* ==================================================================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Users className="h-5 w-5 text-indigo-400" />
                {editingUser ? "Edit Administrator" : "Add New Administrator"}
              </h2>
              <button
                onClick={() => setUserModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editingUser && currentUser?.id === editingUser.id && (
              <div className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-300 flex items-center gap-2">
                <Lock className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                <span>
                  <strong>Self-Account Guard:</strong> You are editing your own profile. Your Role Tier and Active Status
                  are locked and can only be altered by a higher authority tier.
                </span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="mt-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kasun@catalystdigital.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Role Selection (Locked if self or if cannot assign) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assigned Administrative Role Tier
                </label>
                <select
                  value={userFormData.roleId}
                  disabled={Boolean(editingUser && currentUser?.id === editingUser.id)}
                  onChange={(e) => setUserFormData({ ...userFormData, roleId: e.target.value as AdminRole })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(["viewer", "editor", "content_admin", "super_admin"] as AdminRole[]).map((r) => {
                    const allowed = isSuperAdmin || (currentUser && canAssignRole(currentUser.roleId, r)) || (editingUser && editingUser.roleId === r);
                    if (!allowed) return null;

                    return (
                      <option key={r} value={r}>
                        {ROLE_CONFIG[r].label} (Rank {ROLE_HIERARCHY[r].rank})
                      </option>
                    );
                  })}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  {ROLE_CONFIG[userFormData.roleId]?.desc}
                </p>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {editingUser ? "Reset Password (Leave blank to keep current)" : "Password"}
                  </label>
                  {!editingUser && (
                    <button
                      type="button"
                      onClick={() => setUserFormData({ ...userFormData, password: "Admin" + Math.floor(1000 + Math.random() * 9000) + "!" })}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      Generate Random
                    </button>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={editingUser ? "••••••••••••" : "Min 6 characters"}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-3.5 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Active Toggle (Locked if self) */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div>
                  <span className="text-xs font-semibold text-white">Account Status</span>
                  <p className="text-[11px] text-slate-400">Enable or disable login access</p>
                </div>
                {editingUser && currentUser?.id === editingUser.id ? (
                  <span className="text-xs font-medium text-emerald-400">Active (Locked)</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUserFormData({ ...userFormData, isActive: !userFormData.isActive })}
                    className="flex items-center gap-1.5 text-xs font-medium"
                  >
                    {userFormData.isActive ? (
                      <>
                        <ToggleRight className="h-6 w-6 text-emerald-400" />
                        <span className="text-emerald-400">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-6 w-6 text-slate-600" />
                        <span className="text-slate-500">Inactive</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSubmittingUser && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingUser ? "Update Administrator" : "Create Administrator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: DELETE ADMINISTRATOR CONFIRMATION */}
      {/* ==================================================================== */}
      {userDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="h-6 w-6 flex-shrink-0" />
              <h2 className="text-lg font-bold text-white">Confirm Account Deletion</h2>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Are you sure you want to permanently delete the administrator account for{" "}
              <strong className="text-white">{userDeleteTarget.fullName}</strong> ({userDeleteTarget.email})?
            </p>

            {currentUser?.id === userDeleteTarget.id && (
              <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                Self-Deletion Guard: You cannot delete the account you are currently logged in with.
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserDeleteTarget(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isSubmittingUser || currentUser?.id === userDeleteTarget.id}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 disabled:opacity-40"
              >
                {isSubmittingUser && <Loader2 className="h-4 w-4 animate-spin" />}
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT PERMISSION CAPABILITY */}
      {/* ==================================================================== */}
      {permModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Key className="h-5 w-5 text-indigo-400" />
                {editingPerm ? "Edit Permission Key" : "Add Permission Capability"}
              </h2>
              <button
                onClick={() => setPermModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePermission} className="mt-5 space-y-4">
              {/* Permission Key ID */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Permission Key Identifier
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingPerm)}
                  placeholder="e.g. analytics:view or reports:export"
                  value={permFormData.id}
                  onChange={(e) => setPermFormData({ ...permFormData, id: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Capability Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. View Analytics & Performance"
                  value={permFormData.name}
                  onChange={(e) => setPermFormData({ ...permFormData, name: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Category Domain
                </label>
                <select
                  value={permFormData.category}
                  onChange={(e) => setPermFormData({ ...permFormData, category: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="System">System (Core Infrastructure & Maintenance)</option>
                  <option value="Content">Content (Services, Projects, Team, Blog, FAQs)</option>
                  <option value="Communication">Communication (Inquiries & Leads)</option>
                  <option value="Security">Security (Authentication, Auditing, RBAC)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Policy Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what this permission capability enables..."
                  value={permFormData.description}
                  onChange={(e) => setPermFormData({ ...permFormData, description: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPermModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPerm}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSubmittingPerm && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingPerm ? "Update Permission" : "Create Capability"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: DELETE PERMISSION CONFIRMATION */}
      {/* ==================================================================== */}
      {permDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="h-6 w-6 flex-shrink-0" />
              <h2 className="text-lg font-bold text-white">Delete Permission Key</h2>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Are you sure you want to permanently delete the permission capability{" "}
              <strong className="text-white font-mono">{permDeleteTarget.id}</strong> ({permDeleteTarget.name})?
              This will revoke it from all roles across the platform.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPermDeleteTarget(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePermission}
                disabled={isSubmittingPerm}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 disabled:opacity-40"
              >
                {isSubmittingPerm && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
