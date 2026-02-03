import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    
    const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Login failed" },
        { status: res.status },
      );
    }

    const response = NextResponse.json({ user: data.user }, { status: 200 });

    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
