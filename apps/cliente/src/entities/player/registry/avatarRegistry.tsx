import type { ReactNode } from 'react';
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar, GalloAvatar, PeacockAvatar, ChameleonAvatar, BatAvatar, DragonAvatar } from '@/shared/ui/avatars/AvatarIcons';
import { COMPANIONS_MOCK, type CompanionData } from '../model/companions.mock';

export const AVATAR_COMPONENTS: Record<string, ReactNode> = {
  fox: <FoxAvatar />,
  owl: <OwlAvatar />,
  bear: <BearAvatar />,
  cat: <CatAvatar />,
  rabbit: <RabbitAvatar />,
  dog: <DogAvatar />,
  gallo: <GalloAvatar />,
  peacock: <PeacockAvatar />,
  chameleon: <ChameleonAvatar />,
  bat: <BatAvatar />,
  dragon: <DragonAvatar />
};

const DEFAULT_AVATAR_ID = 'fox';

/**
 * Devuelve el componente SVG del avatar. Si no existe, devuelve el Zorro por defecto.
 */
export const getAvatarComponent = (avatarId: string | undefined): ReactNode => {
  if (!avatarId) return AVATAR_COMPONENTS[DEFAULT_AVATAR_ID];
  return AVATAR_COMPONENTS[avatarId] || AVATAR_COMPONENTS[DEFAULT_AVATAR_ID];
};

/**
 * Devuelve los datos completos del compañero (nombre, poder, descripción).
 */
export const getAvatarData = (avatarId: string | undefined): CompanionData => {
  const companion = COMPANIONS_MOCK.find(c => c.id === avatarId);
  return companion || COMPANIONS_MOCK.find(c => c.id === DEFAULT_AVATAR_ID)!;
};

/**
 * Generador de avatar aleatorio (para fallbacks visuales donde dice 'random')
 */
export const getRandomAvatarId = (): string => {
  const keys = Object.keys(AVATAR_COMPONENTS);
  return keys[Math.floor(Math.random() * keys.length)];
};
