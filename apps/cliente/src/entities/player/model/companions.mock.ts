import type { AvatarType } from "@/shared/store/useAvatarStore";

export type CompanionRarity = 'common' | 'mythic';

export interface CompanionData {
  id: AvatarType;
  name: string;
  powerName: string;
  description: string;
  rotation: number;
  rarity: CompanionRarity;
}

export const COMPANIONS_MOCK: CompanionData[] = [
  { 
    id: 'fox', 
    name: 'Zorro', 
    powerName: 'Ladrón Astuto', 
    description: 'Ve la respuesta de tu rival y cópiala. Si aciertas, le robas la mitad de sus puntos.', 
    rotation: -1.5,
    rarity: 'common'
  },
  { 
    id: 'owl', 
    name: 'Búho', 
    powerName: '50/50', 
    description: 'Elimina las opciones incorrectas para que sea más fácil adivinar.', 
    rotation: 1,
    rarity: 'common'
  },
  { 
    id: 'bear', 
    name: 'Oso', 
    powerName: 'Fuerza Bruta', 
    description: 'Gana el DOBLE de puntos si aciertas, pero pierdes puntos si fallas. ¡Arriésgate!', 
    rotation: -0.5,
    rarity: 'common'
  },
  {
    id: 'peacock',
    name: 'Pavo Real',
    powerName: 'Hipnosis de Plumas',
    description: 'Lanza una ilusión que intercambia físicamente la posición de las opciones en las pantallas de tus rivales.',
    rotation: -1,
    rarity: 'mythic'
  },
  {
    id: 'chameleon',
    name: 'Camaleón',
    powerName: 'Mimetismo',
    description: 'Copia instantáneamente el poder del rival seleccionado, y bloquea pasivamente ataques directos hacia ti.',
    rotation: 1,
    rarity: 'mythic'
  },
  {
    id: 'bat',
    name: 'Murciélago',
    powerName: 'Apagón',
    description: 'Oculta el texto de la pregunta a todos los demás jugadores durante los primeros 4 segundos.',
    rotation: -0.5,
    rarity: 'mythic'
  },
  {
    id: 'dragon',
    name: 'Dragón',
    powerName: 'Tierra Quemada',
    description: 'Quema y oculta una opción al azar en las pantallas de todos tus rivales. Aumenta sus pérdidas si se equivocan.',
    rotation: 1.5,
    rarity: 'mythic'
  },
  { 
    id: 'cat', 
    name: 'Gato', 
    powerName: '7 Vidas', 
    description: 'Si te equivocas, recibes la mitad de los puntos como premio de consolación. Un seguro de vida.', 
    rotation: 2,
    rarity: 'common'
  },
  { 
    id: 'rabbit', 
    name: 'Conejo', 
    powerName: 'Impulso', 
    description: 'Si aciertas, ganas +50% de puntos extra por ser veloz.', 
    rotation: -2,
    rarity: 'common'
  },
  { 
    id: 'dog', 
    name: 'Perro', 
    powerName: 'Lealtad', 
    description: 'Ve la respuesta de tu amigo en pantalla para que puedan ayudarse a responder.', 
    rotation: 1.5,
    rarity: 'common'
  },
  {
    id: 'gallo',
    name: 'Gallo',
    powerName: 'Rey del Gallinero',
    description: 'Silencia a todos los demás jugadores. Nadie podrá usar sus poderes en esta ronda.',
    rotation: -1,
    rarity: 'mythic'
  }
];

export const getCompanionById = (id: string): CompanionData | undefined => {
  return COMPANIONS_MOCK.find(c => c.id === id);
};
