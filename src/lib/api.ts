import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";
import { SyncPullResponse, SyncPushItem, SyncPushResult, AuthTokens } from "@/types";

// En dev y prod usamos el proxy de Next.js (/api/backend/*) para evitar CORS.
// Next.js reenvía server-side al backend real.
const BASE_URL = "/api/backend";

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = getRefreshToken();
        const { data } = await axios.post<{ accessToken: string }>(`/api/backend/auth/refresh`, { refreshToken: refresh });
        const user = JSON.parse(localStorage.getItem("vo_user") || "{}");
        saveTokens({ accessToken: data.accessToken, refreshToken: refresh!, userId: user.userId, name: user.name });
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearTokens();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/login", { email, password });
  return data;
}

export async function register(email: string, password: string, name: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/register", { email, password, name });
  return data;
}

export async function pullSync(since: number): Promise<SyncPullResponse> {
  const { data } = await api.get<SyncPullResponse>(`/sync?since=${since}`);
  return data;
}

export async function pushSync(items: SyncPushItem[]): Promise<SyncPushResult[]> {
  const { data } = await api.post<SyncPushResult[]>("/sync/push", items);
  return data;
}

export async function generateWppToken(): Promise<{ token: string; expiresAt: number }> {
  const { data } = await api.post<{ token: string; expiresAt: number }>("/wpp/generate-token");
  return data;
}
