import { create } from 'zustand';

interface PreloadState {
  isCriticalLoaded: boolean;
  backgroundProgress: number; // 0 a 100
  setCriticalLoaded: (status: boolean) => void;
  setBackgroundProgress: (progress: number) => void;
}

export const usePreloadStore = create<PreloadState>((set) => ({
  isCriticalLoaded: false,
  backgroundProgress: 0,
  setCriticalLoaded: (status) => set({ isCriticalLoaded: status }),
  setBackgroundProgress: (progress) => set({ backgroundProgress: progress }),
}));
