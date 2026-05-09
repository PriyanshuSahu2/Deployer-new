type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  // Construct absolute URL for server-side requests
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const res = await fetch(fullUrl, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');

  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw {
      message: data?.message ?? data?.error ?? 'Something went wrong',
      status: res.status,
      errors: data?.errors,
    };
  }

  return data as T;
}
