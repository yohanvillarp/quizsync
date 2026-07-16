import React from 'react';
import { createPortal } from 'react-dom';
import type { Player } from '@/entities/game/model/useGameStore';
import { X } from 'lucide-react';
import { getAvatarComponent } from '@/entities/player/registry/avatarRegistry';

interface TargetSelectorProps {
  players: Player[];
  myDeviceId: string;
  onSelect: (deviceId: string) => void;
  onCancel: () => void;
  title: string;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({ players, myDeviceId, onSelect, onCancel, title }) => {
  const availableTargets = players.filter(p => p.deviceId !== myDeviceId && p.connected);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4">
      <div className="bg-paper p-6 rounded-2xl border-4 border-ink shadow-[8px_8px_0px_0px_var(--color-ink)] w-full max-w-md relative animate-in zoom-in duration-200">
        <button 
          onClick={onCancel}
          className="absolute -top-4 -right-4 bg-high-pink text-ink p-2 rounded-full border-2 border-ink shadow-[2px_2px_0px_0px_var(--color-ink)] hover:scale-110 transition-transform"
        >
          <X size={24} />
        </button>
        
        <h2 className="font-headline text-2xl font-black mb-6 text-center text-ink uppercase tracking-wider">{title}</h2>
        
        {availableTargets.length === 0 ? (
          <p className="text-center font-bold text-ink-offset my-8">No hay otros jugadores disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {availableTargets.map(player => (
              <button
                key={player.deviceId}
                onClick={() => onSelect(player.deviceId)}
                className="flex flex-col items-center gap-2 p-3 border-2 border-ink rounded-xl bg-white hover:bg-high-yellow transition-colors shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--color-ink)]"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                  {getAvatarComponent(player.avatarId)}
                </div>
                <span className="font-bold text-ink truncate w-full text-center">{player.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
