import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${process.env.BACKEND_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        debugger;

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { message: data.error || "Registration failed" },
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
