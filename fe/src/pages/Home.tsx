import { useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import UserProfile from "@/components/UserProfile";
import { useUserStore } from "@/store/userStore";

type Props = {
  onShowLogin: () => void;
  onStart: () => void;
};

export function Home({ onShowLogin, onStart }: Props) {
  const [showProfile, setShowProfile] = useState(false);
  const user = useUserStore((s) => s.userInfo);

  return (
    <div className="flex h-full w-full flex-col">
      <Header onClickProfile={(logged) => (logged ? setShowProfile(true) : onShowLogin())} />
      <div className="flex size-full cursor-default flex-col items-start justify-center gap-8 text-5xl">
        <div
          onClick={() => {
            if (user) onStart();
            else onShowLogin();
          }}
          className="relative right-1/5 w-full -skew-y-6 border-2 border-l-0 border-emerald-400 bg-zinc-800 px-16 py-12 text-end shadow-lg transition duration-200 hover:translate-x-8 hover:-translate-y-1 hover:scale-105 hover:shadow-emerald-400/50 md:right-1/3"
        >
          开始游戏
        </div>
        <div className="relative right-1/5 w-full -skew-y-6 border-2 border-l-0 border-emerald-400 bg-zinc-800 px-16 py-12 text-end shadow-lg transition duration-200 hover:translate-x-8 hover:-translate-y-1 hover:scale-105 hover:shadow-emerald-400/50 md:right-1/3">
          设置
        </div>
        <div className="relative right-1/5 w-full -skew-y-6 border-2 border-l-0 border-emerald-400 bg-zinc-800 px-16 py-12 text-end shadow-lg transition duration-200 hover:translate-x-8 hover:-translate-y-1 hover:scale-105 hover:shadow-emerald-400/50 md:right-1/3">
          关于
        </div>
      </div>

      <Modal open={showProfile} onClose={() => setShowProfile(false)}>
        <UserProfile onLogout={() => setShowProfile(false)} />
      </Modal>
    </div>
  );
}
