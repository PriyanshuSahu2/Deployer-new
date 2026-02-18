import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AppRootPage() {
  const cookieStore = cookies();

  const cookiesHeader = (await cookieStore).toString()

 

  const res = await fetch(`${process.env.NEXT_BACKEND_URL}/workspace/default`, {
    headers: {
      Cookie: cookiesHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  const data = await res.json();

  redirect(`/app/${data.uuid}`);
}
