import { useAchievementsStore } from '@/entities/achievements/model/useAchievementsStore';
import { useGameStore } from '@/entities/game/model/useGameStore';

let isInitialized = false;

export const initUnlockEvaluator = () => {
  if (isInitialized) return;
  isInitialized = true;

  let processedFinishedGame = false;
  let processedRankingRound: string | null = null;

  useGameStore.subscribe((state) => {
    const { gameStatus, players, currentQuestion } = state;
    const { unlockAvatar, updateStats, unlockedAvatars, stats } = useAchievementsStore.getState();

    const deviceId = localStorage.getItem('quizsync_device_id');
    const myPlayer = players.find(p => p.deviceId === deviceId);

    if (!myPlayer) return;

    // Resetear estados procesados al empezar el juego
    if (gameStatus === 'LOBBY' || gameStatus === 'PREPARING') {
      processedFinishedGame = false;
      processedRankingRound = null;
    }

    // Evaluar al terminar la partida
    if (gameStatus === 'FINISHED' && !processedFinishedGame) {
      processedFinishedGame = true;
      updateStats(prev => ({ gamesPlayed: prev.gamesPlayed + 1 }));

      const rankingPlayers = [...players].sort((a, b) => b.score - a.score);
      const myRank = rankingPlayers.findIndex(p => p.deviceId === myPlayer.deviceId) + 1;
      
      // Pavo Real: Ganar 1er lugar (al menos más de 0 puntos)
      if (myRank === 1 && myPlayer.score > 0 && !unlockedAvatars['peacock']) {
        updateStats(prev => ({ gamesWon: prev.gamesWon + 1 }));
        unlockAvatar('peacock');
      }

      // Camaleón: Usar 3 avatares distintos a lo largo del tiempo
      if (myPlayer.avatarId && !stats.avatarsUsed.includes(myPlayer.avatarId)) {
        const newAvatarsUsed = [...stats.avatarsUsed, myPlayer.avatarId];
        updateStats(() => ({ avatarsUsed: newAvatarsUsed }));
        
        if (newAvatarsUsed.length >= 3 && !unlockedAvatars['chameleon']) {
          unlockAvatar('chameleon');
        }
      }
    }
    
    // Evaluar durante las preguntas (Murciélago / Dragón)
    if (gameStatus === 'RANKING' && currentQuestion?.id !== processedRankingRound) {
      processedRankingRound = currentQuestion?.id || null;
      
      // Murciélago: Responder bien estando bajo una maldición o ataque de otro jugador
      const hasCurse = myPlayer.activeEffects?.some(e => 
        e.includes('blindness') || 
        e.includes('silenced') || 
        e.includes('peacock_illusion_active') || 
        e.includes('scorched_earth_active') ||
        e.includes('thief_target_by_')
      );
      
      if (hasCurse && !unlockedAvatars['bat']) {
        unlockAvatar('bat');
      }
      
      if (myPlayer.powerStatus === 'USED') {
        updateStats(prev => ({ powersUsed: prev.powersUsed + 1 }));
        // Se requiere usar 5 poderes en total para desbloquear
        if (stats.powersUsed >= 4 && !unlockedAvatars['dragon']) { // 4 previos + 1 actual = 5
          unlockAvatar('dragon');
        }
      }
    }
  });
};
