import { guestLogin, login } from "@/api";
import { toUserInfo } from "@/api/types";
import { useUserStore } from "@/store/userStore";
import { setAccessToken, setRefreshToken } from "@/utils/auth";
import { useState } from "react";

const LAST_NICKNAME_KEY = "last_nickname";

type Props = {
  onSuccess: () => void;
};

export default function LoginForm({ onSuccess }: Props) {
  const [nickname, setNickname] = useState(() => localStorage.getItem(LAST_NICKNAME_KEY) || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setUserInfo = useUserStore((s) => s.setUserInfo);
  const [way, setWay] = useState<"guest" | "formal">("guest");
  const [password, setPassword] = useState("");

  const handleLogin = async (isGuest: Boolean) => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (isGuest) {
        data = await guestLogin({ nickname });
      } else {
        if (nickname.includes("@")) {
          data = await login({ email: nickname, password });
        } else {
          data = await login({ nickname, password });
        }
      }
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUserInfo(toUserInfo(data.user));
      localStorage.setItem(LAST_NICKNAME_KEY, nickname);
      onSuccess();
    } catch (err) {
      setError(`登录失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col rounded-lg bg-black/50 ring-2 ring-white/50 md:w-3xl">
      <h2 className="p-4 text-2xl">欢迎</h2>
      <div className="flex w-fit flex-row gap-2">
        <div
          className={`cursor-pointer p-4 hover:bg-white/20 ${way === "guest" ? "bg-white/20" : ""}`}
          onClick={() => {
            setWay("guest");
            setError("");
          }}
        >
          游客
        </div>
        <div
          className={`cursor-pointer p-4 hover:bg-white/20 ${way === "formal" ? "bg-white/20" : ""}`}
          onClick={() => {
            setWay("formal");
            setError("");
          }}
        >
          正式用户
        </div>
      </div>
      <div className="flex h-full w-full flex-col p-4">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="输入昵称"
          className="border-b-2 border-black/50 bg-black/20 p-2 outline-none focus:border-white/20"
        />
        {way === "formal" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
            className="mt-2 border-b-2 border-black/50 bg-black/20 p-2 outline-none focus:border-white/20"
          />
        )}
        <button
          onClick={() => {
            handleLogin(way === "guest");
          }}
          disabled={loading || nickname.trim() === "" || (way === "formal" && password.trim() === "")}
          className="mx-auto mt-4 bg-emerald-600 px-4 py-3 text-xl hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {loading ? "登录中..." : way === "guest" ? "游客登录" : "登录"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
