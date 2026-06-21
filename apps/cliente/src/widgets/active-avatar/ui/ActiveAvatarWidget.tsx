import { useMemo } from 'react';
import { useAvatarStore } from '@/shared/store/useAvatarStore';
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

  const activeId = useMemo(() => {
    if (!storeAvatar) return 'fox';
    if (storeAvatar === 'random') {
      return AVATAR_KEYS[Math.floor(Math.random() * AVATAR_KEYS.length)];
    }
    return storeAvatar;
  }, [storeAvatar]);

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden sm:flex items-end animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full border-4 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] overflow-hidden flex items-center justify-center p-2 md:p-3 selected hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--color-ink)] transition-all cursor-pointer flex-shrink-0">
        {ICONS[activeId]}
      </div>
    </div>
  );
}
