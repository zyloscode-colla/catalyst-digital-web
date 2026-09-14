import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  createSessionCookie,
  getCurrentUser,
  verifyCredentials,
} from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    if (action === "logout") {
      await clearSessionCookie();
      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      const result = await verifyCredentials(email, password);
      if (!result.success || !result.user) {
        return NextResponse.json({ error: result.error || "Invalid email address or credentials" }, { status: 401 });
      }

      const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "Web Browser (macOS)";

      await createSessionCookie(result.user, { ipAddress, userAgent });
      return NextResponse.json({
        success: true,
        user: result.user,
        message: `Welcome back, ${result.user.fullName}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth action error:", error);
    return NextResponse.json({ error: "Authentication service error" }, { status: 500 });
  }
}
