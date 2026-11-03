const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const defaultApiUrl = import.meta.env.DEV ? "/api" : "http://localhost:5000/api";

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/$/, "");

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
