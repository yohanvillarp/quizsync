import { useEffect, useState, useMemo } from 'react';
import { useAvatarStore } from '@/shared/store/useAvatarStore';
import { getAvatarData } from '@/entities/avatar/api/getAvatarData';
import type { AvatarData } from '@/entities/avatar/model/types';
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar } from '@/shared/ui/avatars/AvatarIcons';

const AVATAR_KEYS = ['fox', 'owl', 'bear', 'cat', 'rabbit', 'dog'];

const ICONS: Record<string, React.ReactNode> = {
  fox: <FoxAvatar />,
  owl: <OwlAvatar />,
  bear: <BearAvatar />,
  cat: <CatAvatar />,
  rabbit: <RabbitAvatar />,
  dog: <DogAvatar />
};

export function ActiveAvatarWidget() {
  const storeAvatar = useAvatarStore(state => state.selectedAvatar);
  const [data, setData] = useState<AvatarData | null>(null);
  
  // Resolvemos el ID real si es 'random' o nulo
  const activeId = useMemo(() => {
    if (!storeAvatar) return 'fox';
    if (storeAvatar === 'random') {
      return AVATAR_KEYS[Math.floor(Math.random() * AVATAR_KEYS.length)];
    }
    return storeAvatar;
  }, [storeAvatar]);

  useEffect(() => {
    let mounted = true;
    getAvatarData(activeId).then(res => {
      if (mounted) setData(res);
    });
    return () => { mounted = false; };
  }, [activeId]);

  if (!data) return null; // Esperando respuesta asíncrona simulada

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:flex items-end gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Speech Bubble */}
      <div className="relative bg-white border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] p-4 rounded-2xl max-w-[220px] mb-12">
        <p className="font-body text-sm font-bold text-gray-800 leading-relaxed">
          {data.phrase}
        </p>
        
        {/* Triángulo de la burbuja */}
        <div className="absolute -bottom-3 right-6 w-5 h-5 bg-white border-b-2 border-r-2 border-[var(--color-ink)] transform rotate-45 shadow-[3px_3px_0px_var(--color-ink)] z-[-1] translate-x-[-2px] translate-y-[-2px]"></div>
      </div>

      {/* Avatar Graphic */}
      <div className="w-32 h-32 bg-white rounded-full border-4 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] overflow-hidden flex items-center justify-center p-4 selected hover:-translate-y-2 hover:shadow-[8px_8px_0px_var(--color-ink)] transition-all cursor-pointer">
        {ICONS[activeId]}
      </div>
    </div>
  );
}
