import React, { useState } from 'react';
import { useGameStore } from '@/entities/game/model/useGameStore';
import { usePowerAction } from '../model/usePowerAction';
import { TargetSelector } from './TargetSelector';
import { getCompanionById } from '@/entities/player/model/companions.mock';
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar, GalloAvatar } from '@/shared/ui/avatars/AvatarIcons';

const ICONS: Record<string, React.ReactNode> = {
  fox: <FoxAvatar />,
  owl: <OwlAvatar />,
  bear: <BearAvatar />,
  cat: <CatAvatar />,
  rabbit: <RabbitAvatar />,
  dog: <DogAvatar />,
  gallo: <GalloAvatar />
};

export const PowerButton: React.FC = () => {
  const { activatePower, isActivating } = usePowerAction();
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  
  const players = useGameStore(state => state.players);
  const myDeviceId = localStorage.getItem('quizsync_device_id') || '';
  const myPlayer = players.find(p => p.deviceId === myDeviceId);

  if (!myPlayer) return null;

  const isSilenced = myPlayer.activeEffects?.some(e => e.startsWith('silenced_by_gallo'));
  const isAvailable = myPlayer.powerStatus !== 'USED' && !myPlayer.answered && !isSilenced;
  const requiresTarget = myPlayer.avatarId === 'fox' || myPlayer.avatarId === 'dog';
  const targetTitle = myPlayer.avatarId === 'fox' ? '¿A quién quieres robarle?' : '¿Con quién quieres compartir?';
  const companion = getCompanionById(myPlayer.avatarId);

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
    <div className="fixed bottom-6 right-6 z-40 flex items-end group">
      
      {/* Tooltip de Información del Poder (Hover/Focus) */}
      <div className="absolute right-full mr-4 bottom-0 bg-ink text-white p-3 rounded-xl shadow-lg w-48 sm:w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mb-2 border-2 border-white/20">
        <strong className="block text-accent-yellow font-headline uppercase tracking-wider mb-1">
          {companion?.powerName || 'Poder'}
        </strong>
        <p className="text-xs sm:text-sm font-body text-white/90 leading-tight">
          {companion?.description || 'Activa tu habilidad especial.'}
        </p>
      </div>

      <button
        onClick={handleClick}
        disabled={!isAvailable || isActivating}
        className={`p-4 rounded-full border-4 border-ink shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all flex items-center justify-center relative ${
          isAvailable 
            ? "bg-high-yellow hover:bg-high-pink hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-ink)] animate-bounce" 
            : "bg-gray-300 opacity-60 cursor-not-allowed"
        }`}
      >
        <div className={`w-8 h-8 transition-transform ${isAvailable ? "group-hover:scale-125 group-hover:rotate-12" : "grayscale"}`}>
          {ICONS[myPlayer.avatarId] || <FoxAvatar />}
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
