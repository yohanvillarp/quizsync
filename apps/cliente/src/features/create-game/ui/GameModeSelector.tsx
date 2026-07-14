import React from 'react';
import { SoundButton } from '@/shared/ui/SoundButton';
import { GAME_MODES, type GameModeId } from '@/entities/game/model/game-mode.types';
import { Zap, Hexagon } from 'lucide-react';

interface GameModeSelectorProps {
  value: GameModeId;
  onChange: (mode: GameModeId) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-xl">Modo de Juego</label>
      <div className="grid grid-cols-2 gap-3">
        <SoundButton 
          clickSound="click"
          onClick={() => onChange('NORMAL')}
          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-4 transition-all font-bold ${
            value === 'NORMAL' 
              ? "bg-[var(--color-high-yellow)] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              : "bg-white border-gray-300 text-gray-500 hover:border-black"
          }`}
        >
          <div className="flex items-center gap-2">
            <Hexagon size={20} strokeWidth={2.5} />
            <span className="text-lg">{GAME_MODES['NORMAL'].name}</span>
          </div>
        </SoundButton>

        <SoundButton 
          clickSound="click"
          onClick={() => onChange('POWER_MODE')}
          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-4 transition-all font-bold ${
            value === 'POWER_MODE' 
              ? "bg-[var(--color-high-pink)] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              : "bg-white border-gray-300 text-gray-500 hover:border-black"
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap size={20} strokeWidth={2.5} fill={value === 'POWER_MODE' ? "currentColor" : "none"} />
            <span className="text-lg">{GAME_MODES['POWER_MODE'].name}</span>
          </div>
        </SoundButton>
      </div>
      <p className="text-sm font-body font-bold text-gray-600 min-h-[40px] pt-1">
        {GAME_MODES[value].description}
      </p>
    </div>
  );
};
