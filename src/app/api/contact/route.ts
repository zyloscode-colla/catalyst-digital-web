import { NextResponse } from "next/server";
import { submitInquiry } from "@/lib/cms/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    const inquiry = await submitInquiry({
      name,
      email,
      company: company || "",
      message,
      ipAddress,
    });

    return NextResponse.json(
      { success: true, message: "Thank you. Your inquiry has been received.", inquiryId: inquiry.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting contact inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again later." },
      { status: 500 }
    );
  }
}
