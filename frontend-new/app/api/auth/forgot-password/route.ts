import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { email }
    console.log("Forgot password request body:", body);
    const res = await fetch(`${process.env.BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.error || "Failed to send reset email" },
        { status: res.status },
      );
    }

    return NextResponse.json(
      {
        message: data.message || "Password reset link sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
