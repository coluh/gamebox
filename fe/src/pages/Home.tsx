import { useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import UserProfile from "@/components/UserProfile";

type Props = {
  onShowLogin?: () => void;
};

export function Home({ onShowLogin = () => {} }: Props) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex h-full w-full flex-col">
      <Header
        onClickProfile={(logged) =>
          logged ? setShowProfile(true) : onShowLogin()
        }
      />
      <div className="flex size-full cursor-default flex-col items-center justify-start gap-4 p-8 text-2xl">
        <div className="w-md bg-slate-800 px-8 py-4 text-center transition-transform duration-200 hover:scale-105 hover:bg-slate-700">
          开始游戏
        </div>
        <div className="w-md bg-slate-800 px-8 py-4 text-center transition-transform duration-200 hover:scale-105 hover:bg-slate-700">
          设置
        </div>
      </div>

      <Modal open={showProfile} onClose={() => setShowProfile(false)}>
        <UserProfile />
      </Modal>
    </div>
  );
}
