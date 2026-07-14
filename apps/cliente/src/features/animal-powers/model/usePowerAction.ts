import { useState } from 'react';
import { socketClient } from '@/shared/api/ws/socket.client';
import { useGameStore } from '@/entities/game/model/useGameStore';

export const usePowerAction = () => {
  const [isActivating, setIsActivating] = useState(false);
  const roomId = useGameStore(state => state.roomId);

  const activatePower = (targetId?: string) => {
    if (!roomId || isActivating) return;
    
    setIsActivating(true);
    const sourceId = localStorage.getItem('quizsync_device_id') || '';

    socketClient.emit('use_power', {
      roomId,
      sourceId,
      targetId
    });

    // Reset after a short delay to prevent spam
    setTimeout(() => {
      setIsActivating(false);
    }, 1000);
  };

  return { activatePower, isActivating };
};
