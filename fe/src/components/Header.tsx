import { useUserStore } from "@/store/userStore";
import ServerStatus from "./ServerStatus";

type Props = {
  onClickProfile?: (logged: boolean) => void;
};

export default function Header({ onClickProfile = () => {} }: Props) {
  const user = useUserStore((s) => s.userInfo);

  return (
    <header className="flex h-16 flex-row items-center gap-4 bg-zinc-900 px-4">
      <h1 className="cursor-default text-2xl font-bold text-emerald-400">
        GameBox
      </h1>
      <ServerStatus className="ml-auto transition-transform duration-200 hover:translate-y-2 hover:scale-105" />
      <div className="flex h-full items-center font-bold transition-transform duration-200 hover:translate-y-2 hover:scale-105 hover:bg-zinc-800 md:min-w-64">
        {user ? (
          <div
            onClick={() => onClickProfile(true)}
            className="flex h-full w-full cursor-default items-center px-4 py-2 text-lg font-bold whitespace-nowrap"
          >
            <span>{user.nickname}</span>
          </div>
        ) : (
          <button
            onClick={() => onClickProfile(false)}
            className="h-full w-full cursor-pointer px-4 py-2 text-xl font-bold outline-none"
          >
            登录 / 注册
          </button>
        )}
      </div>
    </header>
  );
}
