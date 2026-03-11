// lib/api.ts
// Single Axios instance for the entire project.
// Never import axios directly in hooks or components — always import from here.
//
// Depends on:
//   - @/features/auth/session  (from react-auth-lifecycle skill)
//   - @/lib/env                (from react-rest-advanced skill API3)

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { getAccessToken, clearSession } from "@/features/auth/session";

// ── Client ────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Token Refresh Queue ───────────────────────────────────────────────
// Ensures that if multiple 401s fire simultaneously, only one refresh
// request is made. Others queue and resolve once the token is refreshed.

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post<{ accessToken: string }>(
    `${env.VITE_API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true } // Sends the HttpOnly refresh token cookie
  );
  return data.accessToken;
}

// ── Request Interceptor ───────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ──────────────────────────────────────────────

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig;

    // 401 — attempt silent token refresh once, then force logout
    if (error.response?.status === 401 && original && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        // Resolve all queued requests with the new token
        refreshQueue.forEach((callback) => callback(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Refresh failed — session is dead
        clearSession();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
