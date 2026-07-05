export type ErrorResponse = {
  error: string;
  message: string;
};

export type UserResponse = {
  id: string;
  nickname: string;
  email?: string;
  createdAt: string;
  expiresAt?: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
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
    expiresAt: user.expiresAt ? new Date(user.expiresAt).toLocaleString() : undefined,
  };
}

export type JoinResponse = {
  roomId: string;
  count: number;
};
