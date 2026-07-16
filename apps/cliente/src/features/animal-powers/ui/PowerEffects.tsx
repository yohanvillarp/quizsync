import React from 'react';
import { useGameStore } from '@/entities/game/model/useGameStore';

export const PowerEffects: React.FC = () => {
  const players = useGameStore(state => state.players);
  const myDeviceId = localStorage.getItem('quizsync_device_id') || '';
  const myPlayer = players.find(p => p.deviceId === myDeviceId);

  if (!myPlayer || !myPlayer.activeEffects || myPlayer.activeEffects.length === 0) {
    return null;
  }

  const effects = myPlayer.activeEffects;

  const hasThief = effects.some(e => e.startsWith('thief_target_by_'));
  const hasBruteForce = effects.includes('brute_force_active');
  const hasNineLives = effects.includes('nine_lives_active');
  const hasSpeedBoost = effects.includes('speed_boost_active');
  const hasLoyalty = effects.some(e => e.startsWith('loyalty_recipient_from_') || e.startsWith('loyalty_active_for_'));

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {hasBruteForce && (
        <div className="absolute inset-0 border-[16px] border-[#ba1a1a] opacity-50 mix-blend-multiply transition-opacity duration-1000 animate-pulse"></div>
      )}
      {hasSpeedBoost && (
        <div className="absolute inset-0 border-[8px] border-dashed border-high-yellow opacity-60 animate-pulse"></div>
      )}
      {hasThief && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-ink text-white px-6 py-2 rounded-full font-bold uppercase animate-in slide-in-from-top fade-in drop-shadow-lg">
          ¡Un zorro te tiene en la mira!
        </div>
      )}
      {hasNineLives && (
        <div className="absolute top-4 right-4 bg-high-yellow text-ink px-4 py-2 rounded-full border-2 border-ink font-bold animate-bounce shadow-[2px_2px_0px_0px_var(--color-ink)]">
          🐱 7 Vidas Activas
        </div>
      )}
      {hasLoyalty && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-high-pink text-ink px-4 py-2 rounded-full border-2 border-ink font-bold animate-pulse shadow-[2px_2px_0px_0px_var(--color-ink)]">
          🐶 Vínculo de Lealtad
        </div>
      )}
    </div>
  );
};
