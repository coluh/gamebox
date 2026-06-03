import { api, ApiError } from "@/api/http";
import type { MeResponse } from "@/api/types";
import { useUserStore } from "@/store/userStore";
import { clearTokens } from "@/utils/auth";
import { useState } from "react";

type Props = {
  onLogout?: () => void;
};

export default function UserProfile({ onLogout = () => {} }: Props) {
  const user = useUserStore((s) => s.userInfo);
  const clearUserInfo = useUserStore((s) => s.clearUserInfo);
  const updateUserInfo = useUserStore((s) => s.updateUserInfo);
  const [showBind, setShowBind] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBindEmail = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post<MeResponse>("/bind", { email, password });
      updateUserInfo(data.user);
      setShowBind(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }
      setError("绑定失败");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div>
        <h2 className="text-2xl font-bold">请先登录</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-zinc-900">
      <h2 className="bg-zinc-800 p-4 text-2xl font-bold">用户信息</h2>
      <div className="grid grid-cols-[6rem_1fr] gap-y-2 p-4 text-lg">
        <p>ID</p>
        <p>{user.id}</p>
        <p>昵称</p>
        <p>{user.nickname}</p>
        <p>邮箱</p>
        {user.email ? (
          <p>{user.email}</p>
        ) : showBind ? (
          <div className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="w-md border-b border-zinc-600 bg-zinc-700 p-2 outline-none focus:border-zinc-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-md border-b border-zinc-600 bg-zinc-700 p-2 outline-none focus:border-zinc-400"
            />
            <button
              onClick={handleBindEmail}
              disabled={
                loading || email.trim() === "" || password.trim() === ""
              }
              className="text-md w-fit bg-emerald-600 px-4 py-2 hover:bg-emerald-700"
            >
              {loading ? "绑定中..." : "提交绑定"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-row justify-between">
            <p>无</p>
            <button
              onClick={() => setShowBind(true)}
              className="text-md bg-emerald-600 px-4 py-2 hover:bg-emerald-700"
            >
              绑定邮箱
            </button>
          </div>
        )}
        <p>加入时间</p>
        <p>{user.joinedAt}</p>
      </div>
      <div className="p-4 pt-0">
        <button
          onClick={() => {
            clearUserInfo();
            clearTokens();
            onLogout();
          }}
          className="w-fit border-l border-emerald-400 bg-zinc-800 px-4 py-2 text-red-500 hover:bg-zinc-700"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
