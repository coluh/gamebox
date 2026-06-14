export type ErrorResponse = {
  error: string;
  message: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
};

export type MeResponse = {
  user: UserResponse;
};

export type UserResponse = {
  id: string;
  nickname: string;
  email?: string;
  createdAt: string;
  expiresAt?: string;
};

export type UserInfo = {
  id: string;
  nickname: string;
  email?: string;
  avatarUrl?: string;
  joinedAt: string;
  expiresAt?: string;
};

export function toUserInfo(user: UserResponse): UserInfo {
  return {
    id: user.id,
    nickname: user.nickname,
    email: user.email,
    joinedAt: new Date(user.createdAt).toLocaleString(),
    expiresAt: new Date(user.expiresAt).toLocaleString(),
  };
}
