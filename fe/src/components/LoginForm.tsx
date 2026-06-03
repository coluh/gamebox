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
  const [way, setWay] = useState<"guest" | "formal">("guest");
  const [password, setPassword] = useState("");

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

  const handleFormalLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const body = nickname.includes("@")
        ? { email: nickname, password }
        : { nickname, password };
      const data = await api.post<LoginResponse>("/login", body);
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
      setError("登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-zinc-900 shadow-lg">
      <h2 className="p-4 text-2xl">欢迎</h2>
      <div className="flex w-fit flex-row gap-2 bg-zinc-900">
        <div
          className={`cursor-pointer p-4 hover:bg-zinc-800 ${way === "guest" ? "bg-zinc-800" : ""}`}
          onClick={() => {
            setWay("guest");
            setError("");
          }}
        >
          游客
        </div>
        <div
          className={`cursor-pointer p-4 hover:bg-zinc-800 ${way === "formal" ? "bg-zinc-800" : ""}`}
          onClick={() => {
            setWay("formal");
            setError("");
          }}
        >
          正式用户
        </div>
      </div>
      <div className="flex h-full w-full flex-col bg-zinc-800 p-4">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="输入昵称"
          className="border-b-2 border-zinc-600 bg-zinc-700 p-2 outline-none focus:border-zinc-400"
        />
        {way === "formal" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
            className="mt-2 border-b-2 border-zinc-600 bg-zinc-700 p-2 outline-none focus:border-zinc-400"
          />
        )}
        <button
          onClick={way === "guest" ? handleGuestLogin : handleFormalLogin}
          disabled={
            loading ||
            nickname.trim() === "" ||
            (way === "formal" && password.trim() === "")
          }
          className="mx-auto mt-4 bg-emerald-600 px-4 py-3 text-xl hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:hover:bg-zinc-700"
        >
          {loading ? "登录中..." : way === "guest" ? "游客登录" : "登录"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
