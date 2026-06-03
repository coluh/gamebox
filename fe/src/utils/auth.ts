const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_KEY);

export const setAccessToken = (token: string): void =>
  localStorage.setItem(ACCESS_KEY, token);

export const clearAccessToken = (): void => localStorage.removeItem(ACCESS_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_KEY);

export const setRefreshToken = (token: string): void =>
  localStorage.setItem(REFRESH_KEY, token);

export const clearRefreshToken = (): void =>
  localStorage.removeItem(REFRESH_KEY);

export const clearTokens = (): void => {
  clearAccessToken();
  clearRefreshToken();
};
