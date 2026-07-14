export type GameModeId = 'NORMAL' | 'POWER_MODE';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  features: {
    powersEnabled: boolean;
  };
}

export const GAME_MODES: Record<GameModeId, GameModeConfig> = {
  NORMAL: { 
    id: 'NORMAL', 
    name: 'Normal', 
    features: { 
      powersEnabled: false 
    } 
  },
  POWER_MODE: { 
    id: 'POWER_MODE', 
    name: 'Poderes', 
    features: { 
      powersEnabled: true 
    } 
  }
};
