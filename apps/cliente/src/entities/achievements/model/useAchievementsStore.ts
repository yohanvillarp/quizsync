import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  powersUsed: number;
  perfectAnswersStreak: number;
  maxPerfectStreak: number;
  avatarsUsed: string[];
}

interface AchievementsState {
  unlockedAvatars: Record<string, boolean>;
  newlyUnlocked: string | null;
  stats: GameStats;
  
  // Acciones
  unlockAvatar: (avatarId: string) => void;
  clearNewlyUnlocked: () => void;
  updateStats: (updater: (stats: GameStats) => Partial<GameStats>) => void;
}

const INITIAL_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  powersUsed: 0,
  perfectAnswersStreak: 0,
  maxPerfectStreak: 0,
  avatarsUsed: [],
};

// Algunos siempre están desbloqueados por defecto (los no-míticos)
const INITIAL_UNLOCKED: Record<string, boolean> = {
  fox: true,
  owl: true,
  bear: true,
  cat: true,
  rabbit: true,
  dog: true,
};

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      unlockedAvatars: { ...INITIAL_UNLOCKED },
      newlyUnlocked: null,
      stats: { ...INITIAL_STATS },

      unlockAvatar: (avatarId: string) => {
        const { unlockedAvatars } = get();
        // Si ya está desbloqueado, no hacemos nada
        if (unlockedAvatars[avatarId]) return;

        set((state) => ({
          unlockedAvatars: {
            ...state.unlockedAvatars,
            [avatarId]: true,
          },
          newlyUnlocked: avatarId,
        }));
      },

      clearNewlyUnlocked: () => {
        set({ newlyUnlocked: null });
      },

      updateStats: (updater) => {
        set((state) => ({
          stats: {
            ...state.stats,
            ...updater(state.stats),
          },
        }));
      },
    }),
    {
      name: 'quizsync_achievements',
    }
  )
);
