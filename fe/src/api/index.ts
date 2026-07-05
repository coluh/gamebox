import { request } from "./request";
import type { AuthResponse, JoinResponse, UserResponse } from "./types";

export const guestLogin = (data: { nickname: string }) =>
  request<AuthResponse>({ url: "/guest", method: "POST", data: data });

export const bindEmail = (data: { email: string; password: string }) =>
  request<UserResponse>({ url: "/bind", method: "POST", data: data });

export const login = (data: { email?: string; nickname?: string; password: string }) =>
  request<AuthResponse>({ url: "/login", method: "POST", data: data });

export const joinGame = () => request<JoinResponse>({ url: "/join", method: "POST" });
export const leaveGame = () => request({ url: "/leave", method: "POST" });
