import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";
import { SyncPullResponse, SyncPushItem, SyncPushResult, AuthTokens } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://vidaordenada-production.up.railway.app";

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
        const { data } = await axios.post<{ accessToken: string }>(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
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
