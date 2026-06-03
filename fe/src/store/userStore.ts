import type { UserInfo } from "@/api/types";
import { create } from "zustand";

type UserStore = {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  clearUserInfo: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  userInfo: null,
  setUserInfo: (info) => set({ userInfo: info }),
  updateUserInfo: (info) =>
    set((state) => ({
      userInfo: state.userInfo ? { ...state.userInfo, ...info } : null,
    })),
  clearUserInfo: () => set({ userInfo: null }),
}));
