import React, { useState, useEffect } from 'react';
import { Check, Trophy, Medal } from 'lucide-react';
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar } from '@/shared/ui/avatars/AvatarIcons';

const AnimatedScore = ({ value, duration = 800 }: { value: number, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    if (startValue === endValue) return;

    let animationFrameId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out expo curve for a snappy but smooth finish
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(Math.floor(startValue + (endValue - startValue) * ease));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <>{displayValue}</>;
};

const ICONS: Record<string, React.ReactNode> = {
  fox: <FoxAvatar />,
  owl: <OwlAvatar />,
  bear: <BearAvatar />,
  cat: <CatAvatar />,
  rabbit: <RabbitAvatar />,
  dog: <DogAvatar />,
};

interface PlayerRank {
  id: string;
  name: string;
  avatarId?: string;
  score: number;
  hasAnswered: boolean;
  isMe?: boolean;
  powerPoints?: number;
  powerMessage?: string;
  basePoints?: number;
}

interface RankingBoardProps {
  players: PlayerRank[];
  roundKey?: string;
}

export const RankingBoard: React.FC<RankingBoardProps> = ({ players, roundKey = 'default' }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 1000); // Puntos base
    const t2 = setTimeout(() => setPhase(2), 2500); // Poderes Positivos
    const t3 = setTimeout(() => setPhase(3), 4000); // Poderes Negativos
    const t4 = setTimeout(() => setPhase(4), 5500); // Final
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [roundKey]);

  const getDisplayScore = (player: PlayerRank) => {
    const pScore = player.score;
    const pBase = player.basePoints || 0;
    const pPower = player.powerPoints || 0;
    
    // El score enviado por el server YA incluye todo. Calculamos el previo:
    const prevScore = pScore - pBase - pPower;
    
    if (phase === 0) return prevScore;
    if (phase === 1) return prevScore + pBase;
    if (phase === 2) return prevScore + pBase + (pPower > 0 ? pPower : 0);
    return pScore; // Phase 3 y 4 incluyen castigos negativos
  };

  const sortedPlayers = [...players].sort((a, b) => getDisplayScore(b) - getDisplayScore(a));

  const getPlayerIndex = (playerId: string) => {
    return sortedPlayers.findIndex(p => p.id === playerId);
  };

  const ROW_HEIGHT = 88; // Altura de fila + margen

  return (
    <section className="w-full max-w-3xl animate-float relative mt-4">
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
        <Trophy size={64} />
      </div>

      <div className="hand-drawn-box bg-white p-8 md:p-12 shadow-xl relative group">
        <h2 className="text-3xl font-headline font-black text-ink text-center mb-8 flex items-center justify-center gap-3">
          <Medal className="text-accent-yellow" size={32} />
          Tabla de Posiciones
        </h2>

        <div 
          className="relative w-full max-h-[50vh] overflow-y-auto overflow-x-hidden pr-2 pb-2 scroll-smooth"
          style={{ height: `${players.length * ROW_HEIGHT}px`, minHeight: '150px' }}
        >
          {players.map((player) => {
            const index = getPlayerIndex(player.id);
            const currentScore = getDisplayScore(player);
            
            // Lógica de visibilidad por fases
            const showPositivePower = phase >= 2 && (player.powerPoints || 0) > 0;
            const showNegativePower = phase >= 3 && (player.powerPoints || 0) < 0;
            const showAnyPower = showPositivePower || showNegativePower;
            
            return (
              <div 
                key={player.id}
                className={`absolute left-0 right-0 flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-700 ease-in-out ${
                  player.isMe 
                    ? 'border-ink bg-accent-yellow/20 shadow-[2px_2px_0px_0px_var(--color-ink)] z-10' 
                    : 'border-ink/20 hover:border-ink/50 border-dashed bg-white z-0'
                }`}
                style={{ top: `${index * ROW_HEIGHT}px`, height: `${ROW_HEIGHT - 12}px` }}
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                  <span className="text-xl sm:text-2xl font-sketch font-bold w-6 sm:w-8 text-center text-ink/60">
                    {index + 1}
                  </span>
                  
                  {player.avatarId && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                      {ICONS[player.avatarId] || <FoxAvatar />}
                    </div>
                  )}
                  
                  <span className={`text-sm sm:text-xl font-headline font-bold truncate max-w-[100px] sm:max-w-[200px] ${player.isMe ? 'text-ink' : 'text-ink/80'}`}>
                    {player.name}
                    {player.isMe && <span className="text-[10px] sm:text-xs ml-1 sm:ml-2 bg-ink text-white px-2 py-0.5 rounded-full font-body align-middle">TÚ</span>}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="flex flex-col items-end w-[80px] sm:w-[120px]">
                    <span className={`text-base sm:text-lg font-body font-bold transition-colors duration-300 ${
                      phase === 1 && (player.basePoints || 0) > 0 ? 'text-green-600 scale-110' :
                      phase === 2 && (player.powerPoints || 0) > 0 ? 'text-green-600 scale-110' :
                      phase === 3 && (player.powerPoints || 0) < 0 ? 'text-red-500 scale-110' :
                      'text-ink/70'
                    }`}>
                      <AnimatedScore value={currentScore} /> pts
                    </span>
                    
                    {/* Renderizamos el mensaje de poder SI corresponde a la fase */}
                    {showAnyPower && (
                      <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2 absolute -bottom-3 right-10 sm:right-16 bg-white px-2 rounded border border-ink/10 shadow-sm">
                        <span className={`text-[10px] sm:text-xs font-bold ${showPositivePower ? 'text-green-600' : 'text-red-500'}`}>
                          {showPositivePower ? '+' : ''}{player.powerPoints} pts
                        </span>
                        {player.powerMessage && (
                          <span className="text-[8px] sm:text-[10px] uppercase font-bold text-ink/50 mt-[-2px] tracking-tight truncate max-w-[100px] sm:max-w-none">
                            {player.powerMessage}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="w-6 sm:w-8 flex justify-center">
                    {player.hasAnswered ? (
                      <div className="bg-accent-mint/30 p-1 rounded-full border border-ink/20">
                        <Check size={16} strokeWidth={3} className="text-green-700" />
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-ink/20 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
