type ApiError = { message: string; code?: string };

/** 客户端统一请求封装：携带 Cookie，统一解析 { data } 与错误 */
export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (json as { error?: ApiError } | null)?.error;
    throw new Error(err?.message ?? "请求失败，请重试");
  }

  return (json as { data: T }).data;
}
