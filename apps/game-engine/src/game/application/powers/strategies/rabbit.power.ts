import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class RabbitPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'rabbit';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    sourcePlayer.activeEffects.push('speed_boost_active');
    
    return {
      success: true,
      broadcastEvents: [],
      unicastEvents: []
    };
  }

  calculatePointsModifier(room: RoomState, player: Player, basePoints: number, timeTakenMs: number, isCorrect: boolean, maxPoints: number) {
    if (player.activeEffects.includes('speed_boost_active') && isCorrect) {
      return { powerPoints: Math.floor(basePoints * 0.5), message: 'Bono de Velocidad' };
    }
    return { powerPoints: 0 };
  }
}
