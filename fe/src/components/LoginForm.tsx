import { api, ApiError } from "@/api/http";
import { toUserInfo, type LoginResponse } from "@/api/types";
import { useUserStore } from "@/store/userStore";
import { setAccessToken, setRefreshToken } from "@/utils/auth";
import { useState } from "react";

const LAST_NICKNAME_KEY = "last_nickname";

type Props = {
  onSuccess: () => void;
};

export default function LoginForm({ onSuccess }: Props) {
  const [nickname, setNickname] = useState(
    () => localStorage.getItem(LAST_NICKNAME_KEY) || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setUserInfo = useUserStore((s) => s.setUserInfo);

  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post<LoginResponse>("/guest", { nickname });
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUserInfo(toUserInfo(data.user));
      localStorage.setItem(LAST_NICKNAME_KEY, nickname);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 rounded bg-zinc-800 p-6 shadow-lg">
      <h2 className="text-2xl">欢迎</h2>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="输入昵称"
        className="border-b-2 border-zinc-600 bg-zinc-700 p-2 outline-none focus:border-zinc-400"
      />
      <button
        onClick={handleGuestLogin}
        disabled={loading || nickname.trim() === ""}
        className="mx-auto bg-zinc-700 px-4 py-3 text-xl hover:bg-zinc-600 disabled:text-zinc-500 disabled:hover:bg-zinc-700"
      >
        {loading ? "登录中..." : "游客登录"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
