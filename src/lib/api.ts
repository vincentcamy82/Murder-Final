import axios from "axios";

export const API = "/api";

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mp_token");
}

export function setToken(token: string) {
  localStorage.setItem("mp_token", token);
}

export function clearToken() {
  localStorage.removeItem("mp_token");
}

export function errorDetail(err: unknown): unknown {
  return axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
}

export function formatError(detail: unknown): string {
  if (detail == null) return "Une erreur est survenue.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .join(" ");
  if (typeof detail === "object" && typeof (detail as { msg?: unknown }).msg === "string")
    return (detail as { msg: string }).msg;
  return String(detail);
}

// Le token passe en query param car <img>/<video> ne peuvent pas envoyer de header Authorization.
export function fileUrl(storagePath: string): string {
  const token = getToken();
  const baseUrl = `${API}/files/${storagePath}`;
  if (!token) return baseUrl;
  return `${baseUrl}?token=${encodeURIComponent(token)}`;
}
