import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class CatPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'cat';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    sourcePlayer.activeEffects.push('nine_lives_active');
    
    return {
      success: true,
      broadcastEvents: [],
      unicastEvents: []
    };
  }

  calculatePointsModifier(room: RoomState, player: Player, basePoints: number, timeTakenMs: number, isCorrect: boolean, maxPoints: number) {
    if (player.activeEffects.includes('nine_lives_active') && !isCorrect) {
      return { powerPoints: Math.floor(maxPoints / 2), message: 'Consolación de 7 Vidas' };
    }
    return { powerPoints: 0 };
  }
}
