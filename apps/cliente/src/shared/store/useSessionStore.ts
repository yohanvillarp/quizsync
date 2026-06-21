import { create } from 'zustand';

export type Role = 'guest' | 'player' | 'host';

interface SessionState {
  deviceId: string | null;
  role: Role;
  setDeviceId: (id: string) => void;
  setRole: (role: Role) => void;
  initializeDeviceId: () => string;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  deviceId: null,
  role: 'guest',
  
  setDeviceId: (id) => {
    localStorage.setItem('quizsync_device_id', id);
    set({ deviceId: id });
  },
  
  setRole: (role) => set({ role }),

  initializeDeviceId: () => {
    let currentId = get().deviceId || localStorage.getItem('quizsync_device_id');
    if (!currentId) {
      currentId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('quizsync_device_id', currentId);
    }
    set({ deviceId: currentId });
    return currentId;
  }
}));
