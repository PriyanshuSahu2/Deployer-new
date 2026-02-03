type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const res = await fetch(url, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
}
