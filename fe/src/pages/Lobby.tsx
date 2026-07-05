import { useUserStore } from "@/store/userStore";
import { clearTokens } from "@/utils/auth";
import LoginForm from "@/components/LoginForm";
import UserProfile from "@/components/UserProfile";
import ServerStatus, { type Status } from "@/components/ServerStatus";
import CharacterCard from "@/components/CharacterCard";
import { useState } from "react";

type Props = {
  onStart: () => void;
};

export function Lobby({ onStart }: Props) {
  const user = useUserStore((s) => s.userInfo);
  const clearUserInfo = useUserStore((s) => s.clearUserInfo);
  const [status, setStatus] = useState<Status>("checking");

  return (
    <div className="flex size-full items-center justify-center p-4">
      {user == null ? (
        <LoginForm onSuccess={() => {}} />
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-2 md:h-2/3 md:max-w-3xl md:flex-row lg:max-w-5xl">
          <div className="flex flex-col gap-2 rounded-lg bg-black/50 p-4 ring-2 ring-white/20">
            <UserProfile />
            <ServerStatus onChecked={(s) => setStatus(s)} className="opacity-75" />
            <button
              onClick={() => {
                clearTokens();
                clearUserInfo();
              }}
              className="mt-auto mr-auto text-zinc-300 hover:cursor-pointer hover:text-red-300 hover:underline"
            >
              退出登录
            </button>
          </div>
          <div className="flex flex-col gap-4 rounded-lg bg-black/50 p-4 ring-2 ring-white/20 md:w-full">
            <div className="flex h-80 w-full flex-col items-center justify-center bg-emerald-500/20 md:h-full">
              <CharacterCard />
            </div>
            <button
              onClick={onStart}
              disabled={status !== "online"}
              className="ml-auto bg-emerald-600 px-4 py-2 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              开始游戏
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
