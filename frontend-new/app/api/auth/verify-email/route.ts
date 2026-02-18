import { NextResponse } from "next/server";
// This route is called when the user clicks the email verification link.
// It receives the token from the query parameters and sends it to the backend for verification.
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${process.env.BACKEND_URL}/auth/verify-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { message: data.error || "Email verification failed" },
                { status: res.status },
            );
        }

        const response = NextResponse.json({ user: data.user }, { status: 200 });


        return response;
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
