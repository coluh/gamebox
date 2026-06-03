import { useUserStore } from "@/store/userStore";

export default function UserProfile() {
  const user = useUserStore((s) => s.userInfo);

  if (!user) {
    return (
      <div>
        <h2 className="text-2xl font-bold">请先登录</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2 className="p-4 text-2xl font-bold">用户信息</h2>
      <div className="flex flex-col gap-2 bg-zinc-900 p-4 text-lg">
        <p>ID: {user.id}</p>
        <p>昵称: {user.nickname}</p>
        <p>邮箱: {user.email || "无"}</p>
        <p>加入时间: {user.joinedAt}</p>
      </div>
    </div>
  );
}
