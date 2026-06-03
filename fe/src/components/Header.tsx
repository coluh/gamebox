import { useUserStore } from "@/store/userStore";
import ServerStatus from "./ServerStatus";

type Props = {
  onClickProfile?: (logged: boolean) => void;
};

export default function Header({ onClickProfile = () => {} }: Props) {
  const user = useUserStore((s) => s.userInfo);

  return (
    <header className="flex h-16 flex-row items-center gap-4 bg-slate-900 px-4 text-slate-200">
      <h1 className="text-xl font-bold">GameBox</h1>
      <ServerStatus className="ml-auto" />
      {user ? (
        <div
          onClick={() => onClickProfile(true)}
          className="flex h-full min-w-64 cursor-default flex-row items-center bg-slate-800 px-4 py-2 font-bold"
        >
          <span className="text-lg font-bold whitespace-nowrap">
            {user.nickname}
          </span>
        </div>
      ) : (
        <button
          onClick={() => onClickProfile(false)}
          className="w-64 cursor-pointer bg-slate-800 px-4 py-2 font-bold hover:bg-slate-700"
        >
          登录 / 注册
        </button>
      )}
    </header>
  );
}
