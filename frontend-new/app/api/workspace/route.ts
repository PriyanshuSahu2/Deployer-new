import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookie = (await headers()).get("cookie");

        const res = await fetch(
            `${process.env.BACKEND_URL}/workspace/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookie || "",
                },
                credentials: "include",
                body: JSON.stringify(body),
            }
        );

        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
