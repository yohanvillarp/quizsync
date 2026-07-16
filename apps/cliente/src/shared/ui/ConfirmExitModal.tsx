import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { SoundButton } from './SoundButton';

interface ConfirmExitModalProps {
  isOpen: boolean;
  isHost: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({ 
  isOpen, 
  isHost, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white border-4 border-ink p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_var(--color-ink)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-red-100 p-4 rounded-full mb-4 border-2 border-red-500 text-red-600">
          <AlertTriangle size={48} strokeWidth={2.5} />
        </div>
        
        <h2 className="font-headline font-black text-2xl sm:text-3xl text-ink uppercase mb-2">
          ¿Abandonar la partida?
        </h2>
        
        <p className="font-body text-ink/80 text-lg mb-8 font-medium">
          {isHost 
            ? "Eres el anfitrión de la sala. Si te vas, la partida terminará para todos los jugadores."
            : "Si sales de la partida, perderás tu progreso actual y serás desconectado."
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <SoundButton
            onClick={onCancel}
            clickSound="click"
            className="flex-1 px-6 py-3 bg-white hover:bg-gray-100 text-ink font-headline font-black uppercase tracking-wider rounded-xl border-4 border-ink transition-transform active:translate-y-1"
          >
            Quedarme
          </SoundButton>
          
          <SoundButton
            onClick={onConfirm}
            clickSound="error"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-headline font-black uppercase tracking-wider rounded-xl border-4 border-ink transition-transform active:translate-y-1 shadow-[4px_4px_0px_var(--color-ink)] active:shadow-none"
          >
            <LogOut size={20} />
            Salir
          </SoundButton>
        </div>
      </div>
    </div>
  );
};
