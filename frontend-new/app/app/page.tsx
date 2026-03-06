import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AppRootPage() {
  const cookieStore = cookies();

  const cookiesHeader = (await cookieStore).toString();

  const res = await fetch(`${process.env.BACKEND_URL}/workspaces/default`, {
    headers: {
      Cookie: cookiesHeader,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      redirect('/app/onboarding');
    }
    // Missing token or other errors should go back to the real login page
    redirect('/auth/login');
  }

  const data = await res.json();

  redirect(`/app/${data.uuid}`);
}
