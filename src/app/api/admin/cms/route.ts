import { NextResponse } from "next/server";
import {
  getCurrentUser,
  getActiveSessions,
  getCurrentSessionId,
  revokeSession,
  revokeAllOtherSessions,
  CMS_SESSION_COOKIE,
} from "@/lib/auth/session";
import {
  hasPermission,
  canManageUser,
  canAssignRole,
  canManagePermissionsMatrix,
} from "@/lib/auth/permissions";
import {
  createAdminUser,
  createBlogPost,
  createFaq,
  createPermission,
  createProject,
  createService,
  createTeamMember,
  deleteAdminUser,
  deleteBlogPost,
  deleteFaq,
  deletePermission,
  deleteProject,
  deleteService,
  deleteTeamMember,
  getAdminUsers,
  getBlogPosts,
  getFaqs,
  getInquiries,
  getPagesConfig,
  getPermissions,
  getProjects,
  getRolesWithPermissions,
  getSectionConfigs,
  getServices,
  getSiteSettings,
  getTeamMembers,
  toggleAdminUserActive,
  togglePageActive,
  toggleSectionActive,
  updateAdminUser,
  updateBlogPost,
  updateFaq,
  updateInquiryStatus,
  updatePermission,
  updateProject,
  updateRolePermissions,
  updateSectionConfig,
  updateService,
  updateSiteSettings,
  updateTeamMember,
} from "@/lib/cms/service";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");

  try {
    switch (entity) {
      case "settings":
        return NextResponse.json(await getSiteSettings());
      case "pages":
        return NextResponse.json(await getPagesConfig());
      case "sections":
        return NextResponse.json(await getSectionConfigs(searchParams.get("pageSlug") || undefined));
      case "services":
        return NextResponse.json(await getServices(false));
      case "projects":
        return NextResponse.json(await getProjects(false));
      case "team":
        return NextResponse.json(await getTeamMembers(false));
      case "blog":
        return NextResponse.json(await getBlogPosts(false));
      case "faqs":
        return NextResponse.json(await getFaqs(false));
      case "inquiries":
        return NextResponse.json(await getInquiries());
      case "users":
        return NextResponse.json(await getAdminUsers());
      case "permissions":
        return NextResponse.json({
          permissions: await getPermissions(),
          roles: await getRolesWithPermissions(),
        });
      case "sessions": {
        const currentSessionId = await getCurrentSessionId();
        return NextResponse.json({
          sessions: getActiveSessions(currentSessionId || undefined),
          cookieName: CMS_SESSION_COOKIE,
          security: {
            httpOnly: true,
            sameSite: "Lax",
            secure: process.env.NODE_ENV === "production",
            maxAgeDays: 7,
            validation: "Live Supabase PostgreSQL admin_users verification",
          },
        });
      }
      default:
        return NextResponse.json({
          settings: await getSiteSettings(),
          pages: await getPagesConfig(),
          sections: await getSectionConfigs(),
          services: await getServices(false),
          projects: await getProjects(false),
          team: await getTeamMembers(false),
          blog: await getBlogPosts(false),
          faqs: await getFaqs(false),
          inquiries: await getInquiries(),
          users: await getAdminUsers(),
          permissions: await getPermissions(),
          roles: await getRolesWithPermissions(),
        });
    }
  } catch (error) {
    console.error("CMS GET error:", error);
    return NextResponse.json({ error: "Failed to fetch CMS resources" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { entity, action, data } = payload;

    // RBAC Permission Checks
    switch (entity) {
      case "settings": {
        if (!hasPermission(user.roleId, "settings:manage") && !hasPermission(user.roleId, "maintenance:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions for system settings" }, { status: 403 });
        }
        const updated = await updateSiteSettings(data);
        return NextResponse.json({ success: true, data: updated });
      }

      case "pages": {
        if (!hasPermission(user.roleId, "pages:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage pages" }, { status: 403 });
        }
        if (action === "toggle") {
          const updated = await togglePageActive(data.slug, data.isActive, data.offlineMessage);
          return NextResponse.json({ success: true, data: updated });
        }
        break;
      }

      case "sections": {
        if (!hasPermission(user.roleId, "sections:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage sections" }, { status: 403 });
        }
        if (action === "toggle") {
          const updated = await toggleSectionActive(data.id, data.isActive);
          return NextResponse.json({ success: true, data: updated });
        }
        if (action === "update") {
          const updated = await updateSectionConfig(data.id, data);
          return NextResponse.json({ success: true, data: updated });
        }
        break;
      }

      case "services": {
        if (!hasPermission(user.roleId, "services:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage services" }, { status: 403 });
        }
        if (action === "create") {
          const created = await createService(data);
          return NextResponse.json({ success: true, data: created });
        }
        if (action === "update") {
          const updated = await updateService(data.id, data);
          return NextResponse.json({ success: true, data: updated });
        }
        if (action === "delete") {
          await deleteService(data.id);
          return NextResponse.json({ success: true });
        }
        break;
      }

      case "projects": {
        if (!hasPermission(user.roleId, "projects:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage projects" }, { status: 403 });
        }
        if (action === "create") {
          const created = await createProject(data);
          return NextResponse.json({ success: true, data: created });
        }
        if (action === "update") {
          const updated = await updateProject(data.id, data);
          return NextResponse.json({ success: true, data: updated });
        }
        if (action === "delete") {
          await deleteProject(data.id);
          return NextResponse.json({ success: true });
        }
        break;
      }

      case "team": {
        if (!hasPermission(user.roleId, "team:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage team" }, { status: 403 });
        }
        if (action === "create") {
          const created = await createTeamMember(data);
          return NextResponse.json({ success: true, data: created });
        }
        if (action === "update") {
          const updated = await updateTeamMember(data.id, data);
          return NextResponse.json({ success: true, data: updated });
        }
        if (action === "delete") {
          await deleteTeamMember(data.id);
          return NextResponse.json({ success: true });
        }
        break;
      }

      case "blog": {
        if (!hasPermission(user.roleId, "blog:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage blog" }, { status: 403 });
        }
        if (action === "create") {
          const created = await createBlogPost(data);
          return NextResponse.json({ success: true, data: created });
        }
        if (action === "update") {
          const updated = await updateBlogPost(data.id, data);
          return NextResponse.json({ success: true, data: updated });
        }
        if (action === "delete") {
          await deleteBlogPost(data.id);
          return NextResponse.json({ success: true });
        }
        break;
      }

      case "faqs": {
        if (!hasPermission(user.roleId, "faqs:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage FAQs" }, { status: 403 });
        }
        if (action === "create") {
          const created = await createFaq(data);
          return NextResponse.json({ success: true, data: created });
        }
        if (action === "update") {
          const updated = await updateFaq(data.id, data);
          return NextResponse.json({ success: true, data: updated });
        }
        if (action === "delete") {
          await deleteFaq(data.id);
          return NextResponse.json({ success: true });
        }
        break;
      }

      case "inquiries": {
        if (!hasPermission(user.roleId, "inquiries:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to update inquiries" }, { status: 403 });
        }
        if (action === "updateStatus") {
          const updated = await updateInquiryStatus(data.id, data.status);
          return NextResponse.json({ success: true, data: updated });
        }
        break;
      }

      case "users": {
        if (!hasPermission(user.roleId, "users:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage administrators" }, { status: 403 });
        }

        const allUsers = await getAdminUsers();

        if (action === "create") {
          // Hierarchical boundary: cannot create an administrator with rank >= own rank
          if (!canAssignRole(user.roleId, data.roleId)) {
            return NextResponse.json(
              { error: "Hierarchical privilege violation: you cannot create an administrator with a rank equal to or higher than your own." },
              { status: 403 }
            );
          }
          const created = await createAdminUser(data);
          return NextResponse.json({ success: true, data: created });
        }

        if (action === "update") {
          const target = allUsers.find((u) => u.id === data.id);
          if (!target) {
            return NextResponse.json({ error: "Administrator not found" }, { status: 404 });
          }

          // Self-privilege modification prevention
          if (user.id === data.id) {
            if (data.roleId && data.roleId !== user.roleId) {
              return NextResponse.json(
                { error: "Self-privilege escalation prohibited: you cannot modify your own administrative role." },
                { status: 403 }
              );
            }
            if (data.isActive !== undefined && data.isActive === false) {
              return NextResponse.json(
                { error: "Self-lockout prohibited: you cannot deactivate your own administrative account." },
                { status: 400 }
              );
            }
          } else {
            // Hierarchical check: cannot modify administrator of equal or higher rank
            if (!canManageUser(user.roleId, target.roleId, false)) {
              return NextResponse.json(
                { error: "Hierarchical privilege violation: you cannot modify an administrator of equal or higher rank." },
                { status: 403 }
              );
            }
            // Cannot assign role of equal or higher rank than own
            if (data.roleId && !canAssignRole(user.roleId, data.roleId)) {
              return NextResponse.json(
                { error: "Hierarchical privilege violation: you cannot grant an administrative role equal to or higher than your own rank." },
                { status: 403 }
              );
            }
          }

          const updated = await updateAdminUser(data.id, data, data.newPassword);
          return NextResponse.json({ success: true, data: updated });
        }

        if (action === "toggleActive") {
          if (user.id === data.id) {
            return NextResponse.json(
              { error: "Self-lockout prohibited: you cannot deactivate your own administrative account." },
              { status: 400 }
            );
          }

          const target = allUsers.find((u) => u.id === data.id);
          if (!target) {
            return NextResponse.json({ error: "Administrator not found" }, { status: 404 });
          }

          if (!canManageUser(user.roleId, target.roleId, false)) {
            return NextResponse.json(
              { error: "Hierarchical privilege violation: you cannot modify the status of an administrator of equal or higher rank." },
              { status: 403 }
            );
          }

          const updated = await toggleAdminUserActive(data.id, data.isActive, user.id);
          return NextResponse.json({ success: true, data: updated });
        }

        if (action === "delete") {
          if (user.id === data.id) {
            return NextResponse.json(
              { error: "Self-deletion prohibited: you cannot delete your own administrative account." },
              { status: 400 }
            );
          }

          const target = allUsers.find((u) => u.id === data.id);
          if (!target) {
            return NextResponse.json({ error: "Administrator not found" }, { status: 404 });
          }

          if (!canManageUser(user.roleId, target.roleId, false)) {
            return NextResponse.json(
              { error: "Hierarchical privilege violation: you cannot delete an administrator of equal or higher rank." },
              { status: 403 }
            );
          }

          const result = await deleteAdminUser(data.id, user.id);
          if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to delete administrator" }, { status: 400 });
          }
          return NextResponse.json({ success: true });
        }
        break;
      }

      case "permissions": {
        if (!hasPermission(user.roleId, "users:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage access controls" }, { status: 403 });
        }

        // Only Super Administrators can alter the global role permissions matrix or add/delete capability keys
        if (!canManagePermissionsMatrix(user.roleId)) {
          return NextResponse.json(
            { error: "Hierarchical authority restriction: only Super Administrators have authority to modify the system role permissions matrix or alter capabilities." },
            { status: 403 }
          );
        }

        if (action === "create") {
          const created = await createPermission(data);
          return NextResponse.json({ success: true, data: created });
        }
        if (action === "update") {
          const updated = await updatePermission(data.id, data);
          return NextResponse.json({ success: true, data: updated });
        }
        if (action === "delete") {
          const result = await deletePermission(data.id);
          if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to delete permission" }, { status: 400 });
          }
          return NextResponse.json({ success: true });
        }
        if (action === "updateRolePermissions") {
          const result = await updateRolePermissions(data.roleId, data.permissionIds);
          return NextResponse.json({ success: true, data: result });
        }
        break;
      }

      case "sessions": {
        if (!hasPermission(user.roleId, "users:manage")) {
          return NextResponse.json({ error: "Forbidden: insufficient permissions to manage sessions" }, { status: 403 });
        }

        if (action === "revoke") {
          revokeSession(data.sessionId);
          return NextResponse.json({ success: true, message: "Session revoked successfully" });
        }

        if (action === "revokeAllOther") {
          const currentSessionId = await getCurrentSessionId();
          const count = revokeAllOtherSessions(currentSessionId || "", user.id);
          return NextResponse.json({ success: true, count, message: `Terminated ${count} other active session(s)` });
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid entity or action" }, { status: 400 });
  } catch (error) {
    console.error("CMS POST error:", error);
    return NextResponse.json({ error: "Failed to process CMS action" }, { status: 500 });
  }
}
