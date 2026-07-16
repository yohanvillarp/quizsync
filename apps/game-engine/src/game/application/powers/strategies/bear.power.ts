import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class BearPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'bear';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    sourcePlayer.activeEffects.push('brute_force_active');
    
    return {
      success: true,
      broadcastEvents: [],
      unicastEvents: []
    };
  }

  calculatePointsModifier(room: RoomState, player: Player, basePoints: number, timeTakenMs: number, isCorrect: boolean, maxPoints: number) {
    if (player.activeEffects.includes('brute_force_active')) {
      if (isCorrect) {
        return { powerPoints: basePoints, message: 'Fuerza Bruta (x2)' };
      } else {
        return { powerPoints: -maxPoints, message: `Fallo con Fuerza Bruta (-${maxPoints})` };
      }
    }
    return { powerPoints: 0 };
  }
}
