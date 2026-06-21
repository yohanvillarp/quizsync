import type { PodiumPlayer } from "@/entities/game/model/types";
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar } from "@/shared/ui/avatars/AvatarIcons";
import { useEffect, useState } from "react";
import { Trophy, Star } from "lucide-react";

interface PodiumWidgetProps {
  players: PodiumPlayer[];
}

export function PodiumWidget({ players }: PodiumWidgetProps) {
  // Encontramos los jugadores por su rank (1 = centro, 2 = izquierda, 3 = derecha)
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

  // Control de aparición escalonada:
  // 0: Vacío
  // 1: Aparece 3ro (1.5s)
  // 2: 3ro salta (2.5s)
  // 3: Aparece 2do (4.0s)
  // 4: 2do salta (5.0s)
  // 5: Suspenso (ofuscar 2do y 3ro) (6.5s)
  // 6: Aparece 1ro (8.5s)
  // 7: 1ro salta, se quita ofuscamiento (10.0s)
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>, t3: ReturnType<typeof setTimeout>, t4: ReturnType<typeof setTimeout>, t5: ReturnType<typeof setTimeout>, t6: ReturnType<typeof setTimeout>, t7: ReturnType<typeof setTimeout>;
    
    if (players.length >= 3) {
      t1 = setTimeout(() => setRevealStep(1), 1500);
      t2 = setTimeout(() => setRevealStep(2), 2500);
      t3 = setTimeout(() => setRevealStep(3), 4000);
      t4 = setTimeout(() => setRevealStep(4), 5000);
      t5 = setTimeout(() => setRevealStep(5), 6500);
      t6 = setTimeout(() => setRevealStep(6), 8500);
      t7 = setTimeout(() => setRevealStep(7), 10000);
    } else {
      // Si solo hay 2 jugadores, saltamos los pasos 1 y 2
      t3 = setTimeout(() => setRevealStep(3), 1500);
      t4 = setTimeout(() => setRevealStep(4), 2500);
      t5 = setTimeout(() => setRevealStep(5), 4000);
      t6 = setTimeout(() => setRevealStep(6), 6000);
      t7 = setTimeout(() => setRevealStep(7), 7500);
    }
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); clearTimeout(t7); };
  }, [players.length]);

  // Efecto de Jittering similar al de Podio.html
  const [jitterRotations, setJitterRotations] = useState([0, 0, 0]);
  useEffect(() => {
    const interval = setInterval(() => {
      setJitterRotations([
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isDimmed = revealStep === 5 || revealStep === 6;

  return (
    <div className="relative w-full max-w-5xl flex items-end justify-center gap-4 md:gap-8 pb-12 mt-12 mx-auto">
      
      {/* 2nd Place (Left) */}
      {second && (
        <div className={`flex flex-col items-center flex-1 max-w-[240px] transition-all duration-700 ${isDimmed ? 'opacity-30 grayscale blur-[1px]' : 'opacity-100'}`}>
          <div className={`mb-4 w-full text-center transition-all duration-700 transform ${revealStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className={`w-full ${revealStep >= 4 && revealStep < 5 ? 'character-celebrate' : ''}`}>
              <div className="relative w-32 h-32 mx-auto mb-2 drop-shadow-md">
                {getAvatarComponent(second.avatarId as string)}
              </div>
              <div className="flex justify-center">
                <div 
                  className="mt-2 wobbly-border px-3 py-1 font-headline text-lg font-bold text-[var(--color-ink)] inline-block"
                  style={{ backgroundColor: 'var(--color-paper)', transition: 'transform 0.5s ease-in-out', transform: `rotate(${-2 + jitterRotations[1]}deg)` }}
                >
                  {second.username}
                </div>
              </div>
            </div>
          </div>
          <div 
            className="w-full hard-offset"
            style={{ transition: 'transform 0.5s ease-in-out', transform: `rotate(${jitterRotations[1]}deg)` }}
          >
            <div 
              className="w-full wobbly-border h-48 flex flex-col items-center justify-center"
              style={{ backgroundColor: 'var(--color-paper-dim)' }}
            >
              <span className="font-headline text-5xl font-black text-[var(--color-ink)] opacity-50">2</span>
              <span className="font-body uppercase tracking-widest text-sm text-[var(--color-ink)] font-bold mt-2">Plata</span>
              <span className={`font-body mt-2 text-sm text-[var(--color-ink)] transition-opacity duration-500 ${revealStep >= 3 ? 'opacity-70' : 'opacity-0'}`}>{second.score} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* 1st Place (Center) */}
      {first && (
        <div className="flex flex-col items-center flex-1 max-w-[280px] z-10">
          <div className={`mb-4 w-full text-center transition-all duration-700 transform ${revealStep >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            <div className={`w-full ${revealStep >= 7 ? 'character-celebrate' : ''}`}>
              <div className="relative w-40 h-40 mx-auto mb-2 drop-shadow-md">
                {getAvatarComponent(first.avatarId as string)}
              </div>
              <div className="relative flex justify-center">
                <div className="absolute -top-10 text-[var(--color-high-yellow)] animate-pulse">
                  <Trophy size={48} fill="currentColor" strokeWidth={1} />
                </div>
              </div>
              <div className="flex justify-center">
                <div 
                  className="wobbly-border px-4 py-2 font-headline text-2xl font-black text-[var(--color-ink)] mt-1 inline-block"
                  style={{ backgroundColor: 'var(--color-high-yellow)', transition: 'transform 0.5s ease-in-out', transform: `rotate(${1 + jitterRotations[0]}deg)` }}
                >
                  {first.username}
                </div>
              </div>
            </div>
          </div>
          <div 
            className={`w-full hard-offset transition-all duration-1000 ${revealStep >= 5 && revealStep <= 6 ? 'scale-105 drop-shadow-[0_0_15px_var(--color-high-yellow)]' : ''}`}
            style={{ transition: 'transform 0.5s ease-in-out', transform: `rotate(${jitterRotations[0]}deg)` }}
          >
            <div 
              className="w-full wobbly-border h-72 flex flex-col items-center justify-center"
              style={{ backgroundColor: 'var(--color-high-yellow)' }}
            >
              <span className="font-headline text-7xl font-black text-[var(--color-ink)]">1</span>
              <span className="font-body uppercase tracking-widest text-[var(--color-ink)] font-bold mt-2">Campeón</span>
              <span className={`font-body mt-2 font-bold text-[var(--color-ink)] transition-opacity duration-500 ${revealStep >= 6 ? 'opacity-100' : 'opacity-0'}`}>{first.score} pts</span>
              
              <div className={`mt-4 flex gap-1 transition-opacity duration-500 ${revealStep >= 6 ? 'opacity-40' : 'opacity-0'}`}>
                <Star size={24} fill="currentColor" />
                <Star size={24} fill="currentColor" />
                <Star size={24} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3rd Place (Right) */}
      {third && (
        <div className={`flex flex-col items-center flex-1 max-w-[240px] transition-all duration-700 ${isDimmed ? 'opacity-30 grayscale blur-[1px]' : 'opacity-100'}`}>
          <div className={`mb-4 w-full text-center transition-all duration-700 transform ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className={`w-full ${revealStep >= 2 && revealStep < 5 ? 'character-celebrate' : ''}`}>
              <div className="relative w-28 h-28 mx-auto mb-2 drop-shadow-md">
                {getAvatarComponent(third.avatarId as string)}
              </div>
              <div className="flex justify-center">
                <div 
                  className="mt-2 wobbly-border px-3 py-1 font-headline text-lg font-bold text-[var(--color-ink)] inline-block"
                  style={{ backgroundColor: 'var(--color-paper)', transition: 'transform 0.5s ease-in-out', transform: `rotate(${2 + jitterRotations[2]}deg)` }}
                >
                  {third.username}
                </div>
              </div>
            </div>
          </div>
          <div 
            className="w-full hard-offset"
            style={{ transition: 'transform 0.5s ease-in-out', transform: `rotate(${jitterRotations[2]}deg)` }}
          >
            <div 
              className="w-full wobbly-border h-32 flex flex-col items-center justify-center"
              style={{ backgroundColor: 'var(--color-paper)' }}
            >
              <span className="font-headline text-4xl font-black text-[var(--color-ink)] opacity-30">3</span>
              <span className="font-body uppercase tracking-widest text-[var(--color-ink)] text-sm font-bold mt-2">Bronce</span>
              <span className={`font-body mt-2 text-sm text-[var(--color-ink)] transition-opacity duration-500 ${revealStep >= 1 ? 'opacity-70' : 'opacity-0'}`}>{third.score} pts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
