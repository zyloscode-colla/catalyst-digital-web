import { cookies } from "next/headers";
import type { AdminRole, AdminUser } from "@/types/cms";

export const CMS_SESSION_COOKIE = "catalyst_cms_session";

export const DEMO_USERS: Record<string, { password: string; user: AdminUser }> = {
  "superadmin@catalystdigital.com": {
    password: "Admin123!",
    user: {
      id: "usr-super-admin-01",
      email: "superadmin@catalystdigital.com",
      fullName: "Ashoka Jayasinghe (CEO)",
      roleId: "super_admin",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    },
  },
  "content@catalystdigital.com": {
    password: "Admin123!",
    user: {
      id: "usr-content-admin-02",
      email: "content@catalystdigital.com",
      fullName: "ZylosCode (CDO)",
      roleId: "content_admin",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    },
  },
  "editor@catalystdigital.com": {
    password: "Admin123!",
    user: {
      id: "usr-editor-03",
      email: "editor@catalystdigital.com",
      fullName: "Thilini Karunaratne (COO)",
      roleId: "editor",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    },
  },
  "auditor@catalystdigital.com": {
    password: "Admin123!",
    user: {
      id: "usr-viewer-04",
      email: "auditor@catalystdigital.com",
      fullName: "Security Compliance Auditor",
      roleId: "viewer",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    },
  },
};

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  roleId: AdminRole;
  expiresAt: number;
}

export function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const payload = JSON.parse(raw) as SessionPayload;
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  const session = decodeSession(sessionToken);
  if (!session) return null;

  return {
    id: session.userId,
    email: session.email,
    fullName: session.fullName,
    roleId: session.roleId,
    isActive: true,
    createdAt: new Date(session.expiresAt - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function createSessionCookie(user: AdminUser): Promise<void> {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    roleId: user.roleId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const token = encodeSession(payload);
  cookieStore.set(CMS_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CMS_SESSION_COOKIE);
}
