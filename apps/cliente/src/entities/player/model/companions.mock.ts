import type { AvatarType } from "@/shared/store/useAvatarStore";

export interface CompanionData {
  id: AvatarType;
  name: string;
  powerName: string;
  description: string;
  rotation: number;
}

export const COMPANIONS_MOCK: CompanionData[] = [
  { 
    id: 'fox', 
    name: 'Zorro', 
    powerName: 'Ladrón Astuto', 
    description: 'Ve la respuesta de tu rival y cópiala. Si aciertas, le robas la mitad de sus puntos.', 
    rotation: -1.5 
  },
  { 
    id: 'owl', 
    name: 'Búho', 
    powerName: '50/50', 
    description: 'Elimina las opciones incorrectas para que sea más fácil adivinar.', 
    rotation: 1 
  },
  { 
    id: 'bear', 
    name: 'Oso', 
    powerName: 'Fuerza Bruta', 
    description: 'Gana el DOBLE de puntos si aciertas, pero pierdes puntos si fallas. ¡Arriésgate!', 
    rotation: -0.5 
  },
  { 
    id: 'cat', 
    name: 'Gato', 
    powerName: '7 Vidas', 
    description: 'Si te equivocas, recibes la mitad de los puntos como premio de consolación. Un seguro de vida.', 
    rotation: 2 
  },
  { 
    id: 'rabbit', 
    name: 'Conejo', 
    powerName: 'Impulso', 
    description: 'Si aciertas, ganas +50% de puntos extra por ser veloz.', 
    rotation: -2 
  },
  { 
    id: 'dog', 
    name: 'Perro', 
    powerName: 'Lealtad', 
    description: 'Ve la respuesta de tu amigo en pantalla para que puedan ayudarse a responder.', 
    rotation: 1.5 
  }
];

export const getCompanionById = (id: string): CompanionData | undefined => {
  return COMPANIONS_MOCK.find(c => c.id === id);
};
