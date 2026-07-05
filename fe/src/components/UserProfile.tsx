import { bindEmail } from "@/api";
import { toUserInfo } from "@/api/types";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";

export default function UserProfile() {
  const user = useUserStore((s) => s.userInfo);
  const updateUserInfo = useUserStore((s) => s.updateUserInfo);
  const [expand, setExpand] = useState(false);
  const [showBind, setShowBind] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBindEmail = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await bindEmail({ email, password });
      updateUserInfo(toUserInfo(data));
      setShowBind(false);
    } catch (err) {
      setError(`绑定失败: ${err}`);
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
    <div className="flex max-w-xs flex-col items-start gap-2 md:w-xs">
      <div>
        <h2 className="text-xl font-bold">{user.nickname}</h2>
        <p className="wrap-anywhere text-zinc-500">{user.id}</p>
      </div>
      {!user.email && (
        <p className="text-sm text-red-300">
          账号将于{user.expiresAt}过期。请
          <u onClick={() => setShowBind((b) => !b)} className="hover:cursor-pointer hover:text-blue-500">
            绑定邮箱
          </u>
        </p>
      )}
      {expand && (
        <div className="transition-transform">
          <p>{user.email}</p>
          <p className="text-sm">加入于{user.joinedAt}</p>
        </div>
      )}
      <button
        onClick={() => setExpand((old) => !old)}
        className="rounded bg-zinc-600/50 px-2 py-1 text-sm hover:cursor-pointer hover:bg-zinc-600/75"
      >
        {!expand ? "展开" : "收起"}
      </button>

      {showBind && (
        <div className="flex w-full flex-col gap-2">
          <h3 className="text-lg font-bold">绑定邮箱</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入邮箱"
            className="w-full border-b border-white/20 bg-black/30 p-2 outline-none focus:border-white/50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="设置密码"
            className="w-full border-b border-white/20 bg-black/30 p-2 outline-none focus:border-white/50"
          />
          <div className="flex flex-row gap-4">
            <button
              onClick={handleBindEmail}
              disabled={loading || email.trim() === "" || password.trim() === ""}
              className="w-fit bg-emerald-600 px-4 py-2 text-base hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {loading ? "绑定中..." : "提交绑定"}
            </button>
            <button
              onClick={() => setShowBind(false)}
              disabled={loading}
              className="w-fit px-4 py-2 text-base text-emerald-400 hover:bg-emerald-400/10"
            >
              取消
            </button>
          </div>
          {error && <p className="text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
