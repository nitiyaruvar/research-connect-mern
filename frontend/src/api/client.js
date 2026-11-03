import { apiUrl } from "./config";

export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  const token = window.localStorage.getItem("research-connect-token");
  const response = await fetch(apiUrl(path), {
    method,
    signal,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function uploadFile(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
  return apiRequest("/uploads", { method: "POST", body: { originalName: file.name, dataUrl } });
}

export function getResearchers(filters, signal) {
  const query = new URLSearchParams({ page: "1", limit: "24" });
  if (filters.search) query.set("search", filters.search);
  if (filters.department) query.set("department", filters.department);
  if (filters.expertise) query.set("expertise", filters.expertise);
  if (filters.openToCollaboration) query.set("openToCollaboration", "true");
  return apiRequest(`/researchers?${query}`, { signal });
}

export function getProjects(signal) {
  return apiRequest("/projects?page=1&limit=6", { signal });
}
