import { useAvatarStore } from "@/shared/store/useAvatarStore";
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar } from "@/shared/ui/avatars/AvatarIcons";
import { useState } from "react";
import { audioManager } from "@/core/audio/AudioManager";
import { COMPANIONS_MOCK } from "@/entities/player/model/companions.mock";

const COMPONENT_MAP: Record<string, React.ReactNode> = {
  fox: <FoxAvatar />,
  owl: <OwlAvatar />,
  bear: <BearAvatar />,
  cat: <CatAvatar />,
  rabbit: <RabbitAvatar />,
  dog: <DogAvatar />
};

const AVATAR_OPTIONS = [
  ...COMPANIONS_MOCK.map(c => ({
    ...c,
    component: c.id ? COMPONENT_MAP[c.id] : null
  })),
  { 
    id: 'random', 
    name: 'Sorpréndeme', 
    powerName: 'Aleatorio',
    description: 'Selecciona un compañero al azar con un poder misterioso.',
    component: (
      <div className="w-full h-full flex items-center justify-center text-[80px] font-black text-[var(--color-ink)] animate-pulse drop-shadow-[0_4px_0_var(--color-high-yellow)]">
        ?
      </div>
    ), 
    rotation: 0 
  },
];

export function AvatarInventoryWidget() {
  const { selectedAvatar, setSelectedAvatar } = useAvatarStore();
  const [showEffect, setShowEffect] = useState(false);

  return (
    <div className="w-full relative">
      <div className="mb-12 text-center">
        <h2 className="font-headline text-3xl font-black text-[var(--color-ink)] inline-block relative">
          ELIGE TU COMPAÑERO
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-[var(--color-ink)] opacity-30 transform -rotate-1"></div>
        </h2>
        <p className="mt-4 text-gray-600 font-bold text-sm opacity-80 uppercase tracking-widest">
          Selecciona tu compañero de estudio
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id;
          return (
            <div
              key={avatar.id}
              className={`polaroid p-4 pb-6 flex flex-col items-center cursor-pointer ${
                isSelected ? 'selected jitter' : ''
              }`}
              style={{ transform: isSelected ? 'none' : `rotate(${avatar.rotation}deg)` }}
              onClick={() => {
                if (avatar.id === 'random' && selectedAvatar !== 'random') {
                  setShowEffect(true);
                  setTimeout(() => setShowEffect(false), 800);
                }
                setSelectedAvatar(avatar.id as any);
                if (avatar.id !== 'random') {
                  audioManager.playAvatarSound(avatar.id as string);
                } else {
                  // Opcional: Sonido genérico para "Sorpréndeme"
                  audioManager.playUISound('random-select');
                }
              }}
            >
              <div className="w-full aspect-square bg-white mb-3 flex items-center justify-center relative overflow-visible rounded-xl shadow-inner">
                {avatar.component}
              </div>
              <span className="font-headline text-2xl font-black text-[var(--color-ink)] uppercase">
                {avatar.name}
              </span>
              <span className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-high-pink)] mt-1 mb-2 bg-[var(--color-ink)] px-2 py-0.5 rounded-full">
                {avatar.powerName}
              </span>
              <p className="text-[11px] sm:text-xs text-gray-600 font-medium text-center leading-tight">
                {avatar.description}
              </p>
            </div>
          );
        })}
      </div>

      {showEffect && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center bg-black/10 animate-in fade-in duration-200">
          <div className="animate-bounce -rotate-12">
            <div className="text-[250px] sm:text-[350px] font-black text-[var(--color-high-yellow)] drop-shadow-[15px_15px_0_var(--color-ink)]">
              ?
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
