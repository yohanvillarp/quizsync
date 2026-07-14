export type GameModeId = 'NORMAL' | 'POWER_MODE';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  description: string;
  features: {
    powersEnabled: boolean;
  };
}

export const GAME_MODES: Record<GameModeId, GameModeConfig> = {
  NORMAL: {
    id: 'NORMAL',
    name: 'Normal',
    description: 'El clásico modo de QuizSync. Responde rápido para ganar puntos.',
    features: { powersEnabled: false }
  },
  POWER_MODE: {
    id: 'POWER_MODE',
    name: 'Poderes',
    description: 'Usa la habilidad única de tu animal para ganar ventaja o molestar a tus rivales.',
    features: { powersEnabled: true }
  }
};
