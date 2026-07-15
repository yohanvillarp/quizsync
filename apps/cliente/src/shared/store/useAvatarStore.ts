import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AvatarType = 'fox' | 'owl' | 'bear' | 'cat' | 'rabbit' | 'dog' | 'gallo' | 'random' | null;

interface AvatarState {
  selectedAvatar: AvatarType;
  setSelectedAvatar: (type: AvatarType) => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      selectedAvatar: 'random',
      setSelectedAvatar: (type: AvatarType) => set({ selectedAvatar: type }),
    }),
    {
      name: 'quizsync_avatar_preference',
    }
  )
);
