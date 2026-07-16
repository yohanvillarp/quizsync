import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/entities/game/model/useGameStore';
import { audioManager } from '@/core/audio/AudioManager';
import { getAvatarComponent, getAvatarData } from '@/entities/player/registry/avatarRegistry';
const powerColors: Record<string, string> = {
  fox: 'var(--color-high-pink)',
  owl: 'var(--color-ink)',
  cat: 'var(--color-high-yellow)',
  bear: '#ba1a1a',
  rabbit: 'var(--color-high-yellow)',
  dog: 'var(--color-ink-offset)',
};


export const PowerActivationAnim: React.FC = () => {
  const powerAnimations = useGameStore(state => state.powerAnimations);
  const [activeAnim, setActiveAnim] = useState<any | null>(null);

  const players = useGameStore(state => state.players);

  useEffect(() => {
    const latest = powerAnimations[powerAnimations.length - 1];
    if (latest) {
      setActiveAnim(latest);
      audioManager.playAvatarPowerSound(latest.avatarId);
      
      const timer = setTimeout(() => {
        setActiveAnim(null);
      }, 2500); // Animation duration
      return () => clearTimeout(timer);
    } else {
      setActiveAnim(null);
    }
  }, [powerAnimations]);

  if (!activeAnim) return null;

  const companionData = activeAnim ? getAvatarData(activeAnim.avatarId) : null;
  const powerName = companionData ? `¡${companionData.powerName.toUpperCase()}!` : '¡PODER!';
  const color = powerColors[activeAnim.avatarId] || 'var(--color-ink)';

  const sourcePlayer = players.find(p => p.deviceId === activeAnim.sourceId);
  const targetPlayer = players.find(p => p.deviceId === activeAnim.targetId);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none overflow-hidden">
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
            {sourcePlayer && (
              <span className="text-white/80 font-body font-bold text-xl md:text-3xl uppercase tracking-widest mb-[-10px] z-10 drop-shadow-[2px_2px_0px_var(--color-ink)]">
                {sourcePlayer.name} usó:
              </span>
            )}
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-24 h-24 md:w-40 md:h-40 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)] scale-125">
                {getAvatarComponent(activeAnim.avatarId)}
              </div>
              <h1 className="text-white font-headline font-black text-5xl md:text-8xl italic uppercase tracking-tighter drop-shadow-[6px_6px_0px_var(--color-ink)]" style={{ WebkitTextStroke: '3px var(--color-ink)' }}>
                {powerName}
              </h1>
            </div>
            {targetPlayer && (
              <span className="text-white/90 font-body font-black text-2xl md:text-4xl uppercase tracking-widest mt-[-5px] z-10 drop-shadow-[3px_3px_0px_var(--color-ink)]">
                ¡CONTRA {targetPlayer.name}!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
