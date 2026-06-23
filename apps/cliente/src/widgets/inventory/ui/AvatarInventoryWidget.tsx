import { useAvatarStore, type AvatarType } from "@/shared/store/useAvatarStore";
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar } from "@/shared/ui/avatars/AvatarIcons";
import { useState } from "react";
import { audioManager } from "@/core/audio/AudioManager";

const AVATAR_OPTIONS: { id: AvatarType; name: string; component: React.ReactNode; rotation: number }[] = [
  { id: 'fox', name: 'Zorro', component: <FoxAvatar />, rotation: -1.5 },
  { id: 'owl', name: 'Búho', component: <OwlAvatar />, rotation: 1 },
  { id: 'bear', name: 'Oso', component: <BearAvatar />, rotation: -0.5 },
  { id: 'cat', name: 'Gato', component: <CatAvatar />, rotation: 2 },
  { id: 'rabbit', name: 'Conejo', component: <RabbitAvatar />, rotation: -2 },
  { id: 'dog', name: 'Perro', component: <DogAvatar />, rotation: 1.5 },
  { 
    id: 'random', 
    name: 'Sorpréndeme', 
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
          ELIGE TU AVATAR
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
                setSelectedAvatar(avatar.id);
                if (avatar.id !== 'random') {
                  audioManager.playAvatarSound(avatar.id as string);
                } else {
                  // Opcional: Sonido genérico para "Sorpréndeme"
                  audioManager.playUISound('random-select');
                }
              }}
            >
              <div className="w-full aspect-square bg-white mb-4 flex items-center justify-center relative overflow-visible">
                {avatar.component}
              </div>
              <span className="font-headline text-2xl font-bold text-[var(--color-ink)] uppercase">
                {avatar.name}
              </span>
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
