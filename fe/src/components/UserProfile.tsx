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
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">用户信息</h2>
      <p>ID: {user.id}</p>
      <p>昵称: {user.nickname}</p>
      <p>邮箱: {user.email}</p>
      <p>加入时间: {user.joinedAt}</p>
    </div>
  );
}
