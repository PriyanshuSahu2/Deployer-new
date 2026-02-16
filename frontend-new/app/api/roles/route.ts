import { headers } from 'next/headers';

export async function GET() {
  try {
    const cookie = (await headers()).get('cookie');
    const res = await fetch(`${process.env.BACKEND_URL}/role/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie || '',
      },
      credentials: 'include',
    });

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookie = (await headers()).get('cookie');
    const body = await req.json();
    const res = await fetch(`${process.env.BACKEND_URL}/role/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie || '',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to create role' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookie = (await headers()).get('cookie');
    const body = await req.json();
    const res = await fetch(`${process.env.BACKEND_URL}/role/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie || '',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
