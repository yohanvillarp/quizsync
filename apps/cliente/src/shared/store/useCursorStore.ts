import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CursorType = 'native' | 'dot-ring' | 'pencil' | 'crosshair' | 'sparkle' | 'neon-glow' | 'cyber-glitch' | 'bouncy-bubble' | 'random';

interface CursorState {
  cursorType: CursorType;
  cursorColor: string;
  setCursorType: (type: CursorType) => void;
  setCursorColor: (color: string) => void;
}

export const useCursorStore = create<CursorState>()(
  persist(
    (set) => ({
      cursorType: 'native',
      cursorColor: '#2b2b2b', // Default color (var(--color-ink))
      setCursorType: (type: CursorType) => set({ cursorType: type }),
      setCursorColor: (color: string) => set({ cursorColor: color }),
    }),
    {
      name: 'quizsync_cursor_preference',
    }
  )
);