export type GetToken = () => Promise<string | null>;

const BASE_URL = import.meta.env.VITE_OCL_DASHBOARD_BACKEND_URL as string;

export function createAuthFetch(getToken: GetToken) {
  return async (path: string, init?: RequestInit): Promise<Response> => {
    const token = await getToken();
    const headers = new Headers(init?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(BASE_URL + path, { ...init, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res;
  };
}
