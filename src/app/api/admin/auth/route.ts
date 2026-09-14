import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  createSessionCookie,
  DEMO_USERS,
  getCurrentUser,
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

      const match = DEMO_USERS[email.toLowerCase().trim()];
      if (!match || match.password !== password) {
        return NextResponse.json({ error: "Invalid email address or credentials" }, { status: 401 });
      }

      await createSessionCookie(match.user);
      return NextResponse.json({
        success: true,
        user: match.user,
        message: `Welcome back, ${match.user.fullName}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth action error:", error);
    return NextResponse.json({ error: "Authentication service error" }, { status: 500 });
  }
}
