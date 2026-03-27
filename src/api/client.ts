export type GetToken = () => Promise<string | null>;

function resolveBaseUrl(): string {
  const envUrl = import.meta.env.VITE_OCL_DASHBOARD_BACKEND_URL as string | undefined;
  const fallback = import.meta.env.DEV ? 'http://localhost:3000' : globalThis.location?.origin;
  const raw = (envUrl && envUrl.trim().length > 0 ? envUrl : fallback) ?? '';

  if (raw.startsWith('http://') && globalThis.location?.protocol === 'https:') {
    return 'https://' + raw.slice('http://'.length);
  }
  return raw;
}

export function createAuthFetch(getToken: GetToken) {
  return async (path: string, init?: RequestInit): Promise<Response> => {
    const baseUrl = resolveBaseUrl();
    if (!baseUrl) throw new Error('Backend URL is not configured');
    const token = await getToken();
    const headers = new Headers(init?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(baseUrl + path, {
      credentials: init?.credentials ?? 'omit',
      ...init,
      headers,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res;
  };
}
