import type { PodiumPlayer } from "@/entities/game/model/types";
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar } from "@/shared/ui/avatars/AvatarIcons";
import { useEffect, useState } from "react";
import { Trophy, Star } from "lucide-react";

interface PodiumWidgetProps {
  players: PodiumPlayer[];
  roomId: string;
}

export function PodiumWidget({ players, roomId }: PodiumWidgetProps) {
  const first = players.find(p => p.rank === 1);
  const second = players.find(p => p.rank === 2);
  const third = players.find(p => p.rank === 3);

  const getAvatarComponent = (avatarId?: string) => {
    switch (avatarId) {
      case 'fox': return <FoxAvatar />;
      case 'owl': return <OwlAvatar />;
      case 'bear': return <BearAvatar />;
      case 'cat': return <CatAvatar />;
      case 'rabbit': return <RabbitAvatar />;
      case 'dog': return <DogAvatar />;
      default: return <FoxAvatar />;
    }
  };

  // 0: Vacío, 1: 3ro, 2: 2do, 3: 1ro
  const [revealStep, setRevealStep] = useState(() => {
    if (sessionStorage.getItem(`podium_played_${roomId}`)) {
      return 3;
    }
    return 0;
  });

  useEffect(() => {
    if (sessionStorage.getItem(`podium_played_${roomId}`)) return;

    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>, t3: ReturnType<typeof setTimeout>;
    
    if (players.length >= 3) {
      t1 = setTimeout(() => setRevealStep(1), 500);
      t2 = setTimeout(() => setRevealStep(2), 1500);
      t3 = setTimeout(() => {
        setRevealStep(3);
        sessionStorage.setItem(`podium_played_${roomId}`, 'true');
      }, 3000);
    } else {
      t2 = setTimeout(() => setRevealStep(2), 500);
      t3 = setTimeout(() => {
        setRevealStep(3);
        sessionStorage.setItem(`podium_played_${roomId}`, 'true');
      }, 2000);
    }
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [players.length, roomId]);

  return (
    <div className="relative w-full max-w-4xl flex items-end justify-center gap-2 md:gap-6 mx-auto px-2">
      
      {/* 2nd Place (Left) */}
      {second && (
        <div className="flex flex-col items-center flex-1 max-w-[180px] md:max-w-[220px]">
          <div className={`mb-3 w-full text-center transition-all duration-700 ease-out transform ${revealStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="animate-[bounce_3s_infinite_0.2s]">
              <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-2 drop-shadow-md">
                {getAvatarComponent(second.avatarId as string)}
              </div>
              <div className="flex justify-center">
                <div className="wobbly-border px-3 py-1 font-headline text-sm md:text-base font-bold text-[var(--color-ink)] bg-[var(--color-paper)] -rotate-2 inline-block shadow-sm truncate max-w-full">
                  {second.username}
                </div>
              </div>
            </div>
          </div>
          <div className={`w-full hard-offset transition-transform duration-700 ${revealStep >= 2 ? 'scale-100' : 'scale-y-0 origin-bottom'}`}>
            <div className="w-full wobbly-border h-32 md:h-40 flex flex-col items-center justify-center bg-[var(--color-paper-dim)]">
              <span className="font-headline text-4xl md:text-5xl font-black text-[var(--color-ink)] opacity-50">2</span>
              <span className="font-body uppercase tracking-widest text-xs text-[var(--color-ink)] font-bold mt-1">Plata</span>
              <span className={`font-body mt-1 text-xs md:text-sm text-[var(--color-ink)] font-bold transition-opacity duration-500 delay-300 ${revealStep >= 2 ? 'opacity-80' : 'opacity-0'}`}>{second.score} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* 1st Place (Center) */}
      {first && (
        <div className="flex flex-col items-center flex-1 max-w-[200px] md:max-w-[260px] z-10">
          <div className={`mb-4 w-full text-center transition-all duration-1000 ease-out transform ${revealStep >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-90'}`}>
            <div className="animate-[bounce_3s_infinite]">
              <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-2 drop-shadow-lg">
                {getAvatarComponent(first.avatarId as string)}
              </div>
              <div className="relative flex justify-center">
                <div className="absolute -top-10 md:-top-12 text-[var(--color-high-yellow)] animate-pulse">
                  <Trophy size={40} className="md:w-12 md:h-12" fill="currentColor" strokeWidth={1} />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="wobbly-border px-4 py-1 md:py-2 font-headline text-lg md:text-xl font-black text-[var(--color-ink)] mt-1 bg-[var(--color-high-yellow)] rotate-1 inline-block shadow-md truncate max-w-full">
                  {first.username}
                </div>
              </div>
            </div>
          </div>
          <div className={`w-full hard-offset transition-all duration-1000 origin-bottom ${revealStep >= 3 ? 'scale-100 drop-shadow-[0_0_15px_rgba(242,229,128,0.5)]' : 'scale-y-0'}`}>
            <div className="w-full wobbly-border h-44 md:h-56 flex flex-col items-center justify-center bg-[var(--color-high-yellow)]">
              <span className="font-headline text-5xl md:text-7xl font-black text-[var(--color-ink)]">1</span>
              <span className="font-body uppercase tracking-widest text-[var(--color-ink)] font-bold mt-1 md:mt-2 text-xs md:text-sm">Campeón</span>
              <span className={`font-body mt-1 md:mt-2 font-black text-[var(--color-ink)] text-sm md:text-base transition-opacity duration-500 delay-500 ${revealStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>{first.score} pts</span>
              
              <div className={`mt-2 md:mt-4 flex gap-1 text-[var(--color-ink)] transition-opacity duration-500 delay-700 ${revealStep >= 3 ? 'opacity-50' : 'opacity-0'}`}>
                <Star size={18} fill="currentColor" className="md:w-6 md:h-6" />
                <Star size={18} fill="currentColor" className="md:w-6 md:h-6" />
                <Star size={18} fill="currentColor" className="md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3rd Place (Right) */}
      {third && (
        <div className="flex flex-col items-center flex-1 max-w-[180px] md:max-w-[220px]">
          <div className={`mb-2 w-full text-center transition-all duration-700 ease-out transform ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="animate-[bounce_3s_infinite_0.4s]">
              <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 drop-shadow-md">
                {getAvatarComponent(third.avatarId as string)}
              </div>
              <div className="flex justify-center">
                <div className="mt-1 md:mt-2 wobbly-border px-2 md:px-3 py-1 font-headline text-xs md:text-sm font-bold text-[var(--color-ink)] bg-[var(--color-paper)] rotate-2 inline-block shadow-sm truncate max-w-full">
                  {third.username}
                </div>
              </div>
            </div>
          </div>
          <div className={`w-full hard-offset transition-transform duration-700 ${revealStep >= 1 ? 'scale-100' : 'scale-y-0 origin-bottom'}`}>
            <div className="w-full wobbly-border h-24 md:h-28 flex flex-col items-center justify-center bg-[var(--color-paper)]">
              <span className="font-headline text-3xl md:text-4xl font-black text-[var(--color-ink)] opacity-30">3</span>
              <span className="font-body uppercase tracking-widest text-[var(--color-ink)] text-[10px] md:text-xs font-bold mt-1">Bronce</span>
              <span className={`font-body mt-1 text-[10px] md:text-xs text-[var(--color-ink)] font-bold transition-opacity duration-500 delay-300 ${revealStep >= 1 ? 'opacity-70' : 'opacity-0'}`}>{third.score} pts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
