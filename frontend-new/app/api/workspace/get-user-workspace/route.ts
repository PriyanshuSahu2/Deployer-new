import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cookie = (await headers()).get("cookie");
    const res = await fetch(
      `${process.env.BACKEND_URL}/workspace/get-user-workspaces?${searchParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookie || "",
        },
        credentials: "include",
      }
    );

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}
