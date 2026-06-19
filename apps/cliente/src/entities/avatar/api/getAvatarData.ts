import type { AvatarData } from '../model/types';

// Mock DB
const avatarDatabase: Record<string, AvatarData> = {
  fox: {
    id: 'fox',
    name: 'Zorro',
    phrase: '¡A la victoria con astucia!',
    superPower: 'Ninguno'
  },
  owl: {
    id: 'owl',
    name: 'Búho',
    phrase: 'La sabiduría es nuestra mejor arma.',
    superPower: 'Ninguno'
  },
  bear: {
    id: 'bear',
    name: 'Oso',
    phrase: '¡Fuerza y concentración para cada pregunta!',
    superPower: 'Ninguno'
  },
  cat: {
    id: 'cat',
    name: 'Gato',
    phrase: 'Curiosidad, y 9 vidas para fallar.',
    superPower: 'Ninguno'
  },
  rabbit: {
    id: 'rabbit',
    name: 'Conejo',
    phrase: '¡Velocidad máxima en las respuestas!',
    superPower: 'Ninguno'
  },
  dog: {
    id: 'dog',
    name: 'Perro',
    phrase: '¡El mejor amigo de tus notas!',
    superPower: 'Ninguno'
  }
};

/**
 * Mock asíncrono que simula una petición a la base de datos para obtener
 * la información del avatar seleccionado.
 */
export async function getAvatarData(avatarId: string): Promise<AvatarData | null> {
  return new Promise((resolve) => {
    // Simulamos latencia de red de 400ms
    setTimeout(() => {
      resolve(avatarDatabase[avatarId] || null);
    }, 400);
  });
}
