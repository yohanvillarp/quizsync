import React, { useEffect, useState } from 'react';
import { useAchievementsStore } from '@/entities/achievements/model/useAchievementsStore';
import { getAvatarData, getAvatarComponent } from '@/entities/player/registry/avatarRegistry';
import { Sparkles, X } from 'lucide-react';
import { audioManager } from '@/core/audio/AudioManager';

const THEMES: Record<string, { bg: string, border: string, glow: string }> = {
  gallo: { bg: 'bg-purple-100', border: 'border-purple-600', glow: 'shadow-[0_0_40px_rgba(147,51,234,0.6)]' },
  peacock: { bg: 'bg-blue-100', border: 'border-blue-600', glow: 'shadow-[0_0_40px_rgba(37,99,235,0.6)]' },
  chameleon: { bg: 'bg-green-100', border: 'border-green-600', glow: 'shadow-[0_0_40px_rgba(22,163,74,0.6)]' },
  bat: { bg: 'bg-slate-900', border: 'border-slate-500', glow: 'shadow-[0_0_40px_rgba(100,116,139,0.6)]' },
  dragon: { bg: 'bg-red-100', border: 'border-red-600', glow: 'shadow-[0_0_40px_rgba(220,38,38,0.6)]' },
};

export const UnlockToast: React.FC = () => {
  const { newlyUnlocked, clearNewlyUnlocked } = useAchievementsStore();
  const [isVisible, setIsVisible] = useState(false);
  const [avatarId, setAvatarId] = useState<string | null>(null);

  useEffect(() => {
    if (newlyUnlocked) {
      setAvatarId(newlyUnlocked);
      setIsVisible(true);
      
      // Reproducir sonido épico
      audioManager.playUISound('success');
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          clearNewlyUnlocked();
          setAvatarId(null);
        }, 500); // Esperar animación de salida
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, clearNewlyUnlocked]);

  if (!avatarId) return null;

  const data = getAvatarData(avatarId);
  const theme = THEMES[avatarId] || THEMES.gallo;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100 backdrop-blur-sm bg-black/40 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`relative max-w-sm w-full p-6 rounded-2xl border-4 ${theme.border} ${theme.bg} ${theme.glow} transform transition-all duration-700 ${
          isVisible ? 'scale-100 translate-y-0 rotate-0' : 'scale-50 translate-y-20 -rotate-12'
        }`}
      >
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              clearNewlyUnlocked();
              setAvatarId(null);
            }, 500);
          }}
          className="absolute top-2 right-2 p-1 bg-white rounded-full border-2 border-black hover:bg-red-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black uppercase px-6 py-2 rounded-full border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-bounce flex items-center gap-2">
          <Sparkles size={20} />
          ¡NUEVO COMPAÑERO!
          <Sparkles size={20} />
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <div className="w-40 h-40 relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] animate-[spin_10s_linear_infinite]">
            {/* Sunburst background effect */}
            <div className="absolute inset-0 bg-white/50 rounded-full blur-xl scale-150"></div>
          </div>
          <div className="absolute w-40 h-40 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
            {getAvatarComponent(avatarId)}
          </div>
          
          <h2 className={`mt-6 font-display text-4xl font-black uppercase tracking-wider ${avatarId === 'bat' ? 'text-white' : 'text-black'}`}>
            {data.name}
          </h2>
          
          <p className={`mt-2 font-body font-bold text-lg ${avatarId === 'bat' ? 'text-gray-300' : 'text-gray-700'}`}>
            ¡Has demostrado tu valía!
          </p>
          
          <div className="mt-4 bg-black/10 px-4 py-2 rounded-xl">
            <p className={`font-headline text-sm font-bold uppercase ${avatarId === 'bat' ? 'text-gray-300' : 'text-black/60'}`}>Poder Único</p>
            <p className={`font-black text-xl ${avatarId === 'bat' ? 'text-white' : 'text-black'}`}>{data.powerName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
