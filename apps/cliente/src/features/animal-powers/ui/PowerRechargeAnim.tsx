import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/entities/game/model/useGameStore';
import { audioManager } from '@/core/audio/AudioManager';
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar, GalloAvatar } from '@/shared/ui/avatars/AvatarIcons';

const powerColors: Record<string, string> = {
  fox: 'var(--color-high-pink)',
  owl: 'var(--color-ink)',
  cat: 'var(--color-high-yellow)',
  bear: '#ba1a1a',
  rabbit: 'var(--color-high-yellow)',
  dog: 'var(--color-ink-offset)',
  gallo: 'var(--color-accent-pink)'
};

const ICONS: Record<string, React.ReactNode> = {
  fox: <FoxAvatar />,
  owl: <OwlAvatar />,
  bear: <BearAvatar />,
  cat: <CatAvatar />,
  rabbit: <RabbitAvatar />,
  dog: <DogAvatar />,
  gallo: <GalloAvatar />
};

export const PowerRechargeAnim: React.FC = () => {
  const { powerJustRecharged, clearPowerJustRecharged, players, gameStatus } = useGameStore();
  const [isVisible, setIsVisible] = useState(false);
  
  const myDeviceId = localStorage.getItem('quizsync_device_id') || '';
  const myPlayer = players.find(p => p.deviceId === myDeviceId);

  useEffect(() => {
    if (powerJustRecharged && gameStatus === 'RANKING') {
      setIsVisible(true);
      audioManager.playUISoundWithCooldown('power-activation', 1500);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        clearPowerJustRecharged();
      }, 2500); 
      return () => clearTimeout(timer);
    }
  }, [powerJustRecharged, gameStatus, clearPowerJustRecharged]);

  if (!isVisible || !myPlayer) return null;

  const color = powerColors[myPlayer.avatarId] || 'var(--color-ink)';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none overflow-hidden">
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay animate-pulse" 
        style={{ backgroundColor: color, animationDuration: '0.2s' }} 
      />

      {/* Screen Shake Container */}
      <div className="w-full flex items-center justify-center animate-sketch relative">
        {/* Speed lines effect */}
        <div className="absolute inset-0 border-t-8 border-b-8 border-dashed opacity-50 scale-150 -rotate-12" style={{ borderColor: color }} />
        
        {/* Slanted banner crossing screen quickly */}
        <div 
          className="w-[120vw] py-8 border-y-8 border-ink shadow-[12px_12px_0px_0px_var(--color-ink)] flex items-center justify-center -rotate-6 animate-in slide-in-from-left-[100%] duration-300 ease-out"
          style={{ backgroundColor: color }}
        >
          <div className="flex flex-col items-center justify-center animate-pulse" style={{ animationDuration: '0.1s' }}>
            <span className="text-white/80 font-body font-bold text-xl md:text-3xl uppercase tracking-widest mb-[-10px] z-10 drop-shadow-[2px_2px_0px_var(--color-ink)]">
              ¡Poder Recargado!
            </span>
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-24 h-24 md:w-40 md:h-40 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)] scale-125">
                {ICONS[myPlayer.avatarId] || <FoxAvatar />}
              </div>
              <h1 className="text-white font-headline font-black text-5xl md:text-8xl italic uppercase tracking-tighter drop-shadow-[6px_6px_0px_var(--color-ink)]" style={{ WebkitTextStroke: '3px var(--color-ink)' }}>
                ¡LISTO PARA USAR!
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
