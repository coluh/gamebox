import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  clearTokens,
} from "@/utils/auth";
import type { ErrorResponse } from "./types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3600/api";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const NO_REFRESH_PATHS = ["/login", "/guest", "/refresh"];

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
      ...options.headers,
    },
  });

  if (res.status === 401 && !NO_REFRESH_PATHS.some((p) => path.startsWith(p))) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.accessToken);
        return request(path, options); // Retry original request
      }
    }

    clearTokens();
    throw new Error("登录已过期");
  }

  if (!res.ok) {
    // const body = (await res.json()) as ErrorResponse;
    // throw new ApiError(body.error, body.message, res.status);
    let body: ErrorResponse;
    try {
      body = (await res.json()) as ErrorResponse;
    } catch {
      console.error("Failed to parse error response", res);
      throw new Error(`请求失败，状态码 ${res.status}`);
    }
    throw new ApiError(body.error, body.message, res.status);
  }

  return res.json() as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: any) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: any) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
