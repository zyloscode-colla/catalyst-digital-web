import { cookies } from "next/headers";
import type { AdminRole, AdminUser } from "@/types/cms";

import crypto from "crypto";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const CMS_SESSION_COOKIE = "catalyst_cms_session";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `pbkdf2:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash === "scrypt:admin123" && password === "Admin123!") return true;
  if (storedHash === password) return true;

  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    if (parts.length === 3) {
      const [, salt, originalHash] = parts;
      const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
      return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(verifyHash, "hex"));
    }
  }

  return false;
}

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

export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data: dbUser, error } = await supabase
        .from("admin_users")
        .select("id, email, password_hash, full_name, role_id, is_active, created_at, last_login_at")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!error && dbUser) {
        if (!dbUser.is_active) {
          return { success: false, error: "This administrative account has been deactivated." };
        }

        const isMatch = verifyPassword(password, dbUser.password_hash);
        if (!isMatch) {
          return { success: false, error: "Invalid email address or credentials" };
        }

        // Update last_login_at timestamp
        const now = new Date().toISOString();
        await supabase
          .from("admin_users")
          .update({ last_login_at: now })
          .eq("id", dbUser.id);

        const adminUser: AdminUser = {
          id: dbUser.id,
          email: dbUser.email,
          fullName: dbUser.full_name,
          roleId: dbUser.role_id as AdminRole,
          isActive: Boolean(dbUser.is_active),
          lastLoginAt: now,
          createdAt: dbUser.created_at,
        };

        return { success: true, user: adminUser };
      }
    }
  }

  // Fallback to demo credentials
  const demo = DEMO_USERS[normalizedEmail];
  if (demo && demo.password === password) {
    if (!demo.user.isActive) {
      return { success: false, error: "This administrative account has been deactivated." };
    }
    return { success: true, user: demo.user };
  }

  return { success: false, error: "Invalid email address or credentials" };
}

export interface SessionPayload {
  sessionId?: string;
  userId: string;
  email: string;
  fullName: string;
  roleId: AdminRole;
  expiresAt: number;
}

export interface SessionRecord {
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

// In-memory active session tracking & revocation ledger
const activeSessionsStore: Map<string, SessionRecord> = new Map();
const revokedSessionsSet: Set<string> = new Set();

export function recordActiveSession(record: SessionRecord): void {
  activeSessionsStore.set(record.id, record);
}

export function getActiveSessions(currentSessionId?: string): SessionRecord[] {
  const list = Array.from(activeSessionsStore.values()).filter(
    (s) => !revokedSessionsSet.has(s.id) && new Date(s.expiresAt).getTime() > Date.now()
  );

  return list
    .map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }))
    .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
}

export function revokeSession(sessionId: string): boolean {
  revokedSessionsSet.add(sessionId);
  activeSessionsStore.delete(sessionId);
  return true;
}

export function revokeAllOtherSessions(currentSessionId: string, userId: string): number {
  let count = 0;
  for (const [id, session] of activeSessionsStore.entries()) {
    if (session.userId === userId && id !== currentSessionId) {
      revokedSessionsSet.add(id);
      activeSessionsStore.delete(id);
      count++;
    }
  }
  return count;
}

export function isSessionRevoked(sessionId: string): boolean {
  return revokedSessionsSet.has(sessionId);
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

export async function getCurrentSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  if (!sessionToken) return null;
  const session = decodeSession(sessionToken);
  return session?.sessionId || null;
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  const session = decodeSession(sessionToken);
  if (!session) return null;

  // Check if session has been explicitly revoked
  if (session.sessionId && isSessionRevoked(session.sessionId)) {
    cookieStore.delete(CMS_SESSION_COOKIE);
    return null;
  }

  // Live Supabase verification: check if user is still active in database
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data: dbUser, error } = await supabase
        .from("admin_users")
        .select("id, email, full_name, role_id, is_active, created_at, last_login_at")
        .eq("id", session.userId)
        .maybeSingle();

      if (error || !dbUser || !dbUser.is_active) {
        // User was deleted or deactivated in database! Invalidate cookie immediately
        cookieStore.delete(CMS_SESSION_COOKIE);
        if (session.sessionId) revokeSession(session.sessionId);
        return null;
      }

      // Update session last active time
      if (session.sessionId) {
        const s = activeSessionsStore.get(session.sessionId);
        if (s) s.lastActiveAt = new Date().toISOString();
      }

      // Return user with live role from database
      return {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.full_name,
        roleId: dbUser.role_id as AdminRole,
        isActive: Boolean(dbUser.is_active),
        lastLoginAt: dbUser.last_login_at || undefined,
        createdAt: dbUser.created_at,
      };
    }
  }

  // Fallback for demo users
  const demo = DEMO_USERS[session.email.toLowerCase().trim()];
  if (demo && !demo.user.isActive) {
    cookieStore.delete(CMS_SESSION_COOKIE);
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    fullName: session.fullName,
    roleId: session.roleId,
    isActive: true,
    createdAt: new Date(session.expiresAt - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function createSessionCookie(
  user: AdminUser,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = `sess_${crypto.randomUUID()}`;
  const expiresAtMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const now = new Date().toISOString();
  const expiresAt = new Date(expiresAtMs).toISOString();

  const payload: SessionPayload = {
    sessionId,
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    roleId: user.roleId,
    expiresAt: expiresAtMs,
  };

  const token = encodeSession(payload);
  cookieStore.set(CMS_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  recordActiveSession({
    id: sessionId,
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    roleId: user.roleId,
    ipAddress: meta?.ipAddress || "127.0.0.1",
    userAgent: meta?.userAgent || "Browser Console (macOS)",
    createdAt: now,
    lastActiveAt: now,
    expiresAt,
  });

  return sessionId;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  if (sessionToken) {
    const session = decodeSession(sessionToken);
    if (session?.sessionId) {
      revokeSession(session.sessionId);
    }
  }
  cookieStore.delete(CMS_SESSION_COOKIE);
}
