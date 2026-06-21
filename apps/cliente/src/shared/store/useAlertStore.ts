import { create } from 'zustand';

type AlertType = 'alert' | 'confirm';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  resolvePromise: ((value: boolean) => void) | null;
  
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  close: (result?: boolean) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  resolvePromise: null,

  showAlert: (message, title = 'Aviso') => {
    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        type: 'alert',
        title,
        message,
        resolvePromise: () => resolve(),
      });
    });
  },

  showConfirm: (message, title = 'Confirmar Acción') => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolvePromise: resolve,
      });
    });
  },

  close: (result = false) => {
    const { resolvePromise } = get();
    if (resolvePromise) {
      resolvePromise(result);
    }
    set({
      isOpen: false,
      resolvePromise: null,
    });
  },
}));
