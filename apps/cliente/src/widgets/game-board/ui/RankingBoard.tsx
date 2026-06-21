import React from 'react';
import { Check, Trophy, Medal } from 'lucide-react';

interface PlayerRank {
  id: string;
  name: string;
  score: number;
  hasAnswered: boolean;
  isMe?: boolean;
}

interface RankingBoardProps {
  players: PlayerRank[];
}

export const RankingBoard: React.FC<RankingBoardProps> = ({ players }) => {
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

        <div className="flex flex-col gap-4">
          {players.map((player, index) => (
            <div 
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                player.isMe 
                  ? 'border-ink bg-accent-yellow/20 shadow-[2px_2px_0px_0px_var(--color-ink)]' 
                  : 'border-ink/20 hover:border-ink/50 border-dashed'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-sketch font-bold w-8 text-center text-ink/60">
                  {index + 1}
                </span>
                <span className={`text-xl font-headline font-bold ${player.isMe ? 'text-ink' : 'text-ink/80'}`}>
                  {player.name}
                  {player.isMe && <span className="text-xs ml-2 bg-ink text-white px-2 py-0.5 rounded-full font-body align-middle">TÚ</span>}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <span className="text-lg font-body font-bold text-ink/70">
                  {player.score} pts
                </span>
                <div className="w-8 flex justify-center">
                  {player.hasAnswered ? (
                    <div className="bg-accent-mint/30 p-1 rounded-full border border-ink/20">
                      <Check size={18} strokeWidth={3} className="text-green-700" />
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-ink/20 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
