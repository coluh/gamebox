import { useUserStore } from "@/store/userStore";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "@/utils/auth";
import axios from "axios";
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3600/api";

// wrap url and header
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// fill accessToken
instance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// auto refresh token
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const refreshToken = async (): Promise<string> => {
  const res = await instance.post("/auth/refresh", { refreshToken: getRefreshToken() });
  return res.data.accessToken;
};

instance.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const config = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = err.response?.status;
    if (status !== 401 || config._retry) {
      return Promise.reject(err);
    }
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        setAccessToken(newToken);
        pendingRequests.forEach((cb) => cb(newToken));
        pendingRequests = [];
        config._retry = true;
        config.headers.Authorization = `Bearer ${newToken}`;
        return instance(config);
      } catch (refreshError) {
        clearTokens();
        useUserStore().clearUserInfo();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return new Promise((resolve) => {
      pendingRequests.push((token: string) => {
        config._retry = true;
        config.headers.Authorization = `Bearer ${token}`;
        resolve(instance(config));
      });
    });
  },
);

// wrap type and decode
export const request = <T>(config: AxiosRequestConfig): Promise<T> => instance(config).then((res) => res.data);
