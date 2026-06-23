import { create } from 'zustand';
import { audioManager } from './AudioManager';

interface AudioState {
  isMuted: boolean;
  masterVolume: number;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
}

const savedVolume = localStorage.getItem('quizsync_volume');
const initialVolume = savedVolume ? parseFloat(savedVolume) : 1.0;

const savedMuted = localStorage.getItem('quizsync_muted');
const initialMuted = savedMuted === 'true';

// Inicializar AudioManager con los valores guardados
audioManager.setVolume(initialVolume);
audioManager.setMute(initialMuted);

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: initialMuted,
  masterVolume: initialVolume,

  toggleMute: () => set((state) => {
    const newMuted = !state.isMuted;
    audioManager.setMute(newMuted);
    localStorage.setItem('quizsync_muted', newMuted.toString());
    return { isMuted: newMuted };
  }),

  setVolume: (vol: number) => set(() => {
    // Normalizar volumen entre 0.0 y 1.0
    const normalizedVolume = Math.max(0, Math.min(1, vol));
    audioManager.setVolume(normalizedVolume);
    localStorage.setItem('quizsync_volume', normalizedVolume.toString());
    return { masterVolume: normalizedVolume };
  }),
}));
