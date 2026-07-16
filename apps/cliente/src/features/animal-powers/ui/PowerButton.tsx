import React, { useState } from 'react';
import { useGameStore } from '@/entities/game/model/useGameStore';
import { usePowerAction } from '../model/usePowerAction';
import { TargetSelector } from './TargetSelector';
import { getAvatarComponent, getAvatarData } from '@/entities/player/registry/avatarRegistry';

export const PowerButton: React.FC = () => {
  const { activatePower, isActivating } = usePowerAction();
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  
  const players = useGameStore(state => state.players);
  const myDeviceId = localStorage.getItem('quizsync_device_id') || '';
  const myPlayer = players.find(p => p.deviceId === myDeviceId);

  if (!myPlayer) return null;

  const isSilenced = myPlayer.activeEffects?.some(e => e.startsWith('silenced_by_gallo'));
  const isAvailable = myPlayer.powerStatus !== 'USED' && !myPlayer.answered && !isSilenced;
  
  // Si el camaleón copió un poder, usamos ese ID para la lógica visual y de target
  const effectiveAvatarId = myPlayer.copiedAvatarId || myPlayer.avatarId;
  const requiresTarget = effectiveAvatarId === 'fox' || effectiveAvatarId === 'dog' || (effectiveAvatarId === 'chameleon');
  
  const companionData = getAvatarData(effectiveAvatarId);
  const targetTitle = effectiveAvatarId === 'fox' ? '¿A quién quieres robarle?' : effectiveAvatarId === 'chameleon' ? '¿A quién quieres copiar?' : '¿Con quién quieres compartir?';

  const handleClick = () => {
    if (!isAvailable || isActivating) return;
    
    if (requiresTarget) {
      setShowTargetSelector(true);
    } else {
      activatePower();
    }
  };

  const handleTargetSelect = (targetId: string) => {
    setShowTargetSelector(false);
    activatePower(targetId);
  };

  return (
    <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-40 flex items-end group scale-75 sm:scale-100 origin-bottom-right">
      
      {/* Tooltip de Información del Poder (Hover/Focus) */}
      <div className="absolute right-full mr-4 bottom-0 bg-ink text-white p-3 rounded-xl shadow-lg w-48 sm:w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mb-2 border-2 border-white/20 hidden sm:block">
        <strong className="block text-accent-yellow font-headline uppercase tracking-wider mb-1">
          {companionData?.powerName || 'Poder'}
        </strong>
        <p className="text-xs sm:text-sm font-body text-white/90 leading-tight">
          {companionData?.description || 'Activa tu habilidad especial.'}
        </p>
      </div>

      <button
        onClick={handleClick}
        disabled={!isAvailable || isActivating}
        className={`p-3 sm:p-4 rounded-full border-4 border-ink shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all flex items-center justify-center relative ${
          isAvailable 
            ? "bg-high-yellow hover:bg-high-pink hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-ink)] animate-bounce" 
            : "bg-gray-300 opacity-60 cursor-not-allowed"
        }`}
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
          {myPlayer.copiedAvatarId && (
            <div className="absolute -top-2 -right-2 bg-high-pink text-ink text-xs font-black px-2 py-0.5 rounded-full border-2 border-ink animate-pulse z-10">
              COPIADO
            </div>
          )}
          <div className="w-full h-full drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            {getAvatarComponent(effectiveAvatarId)}
          </div>
        </div>
        
        {isAvailable && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-high-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-high-pink border-2 border-ink"></span>
          </span>
        )}
      </button>

      {showTargetSelector && (
        <TargetSelector 
          players={players} 
          myDeviceId={myDeviceId} 
          title={targetTitle}
          onSelect={handleTargetSelect} 
          onCancel={() => setShowTargetSelector(false)} 
        />
      )}
    </div>
  );
};
