import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookies = (await headers()).get("cookie");

        const response = await fetch(`${process.env.BACKEND_URL}/workspace/invite-member`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookies || "",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ error: errorData.error || "Failed to invite member" }), { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to invite member" }), { status: 500 });
    }
}