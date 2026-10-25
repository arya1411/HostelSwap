export async function api(path, options = {}) {
  const token = sessionStorage.getItem("hs_token");
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res
    .json()
    .catch(() => ({ error: "Could not reach the server." }));
  if (!res.ok) {
    if (res.status === 401 && token) {
      sessionStorage.removeItem("hs_token");
      window.dispatchEvent(new Event("session-expired"));
    }
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}
