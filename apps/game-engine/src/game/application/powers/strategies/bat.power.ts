import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class BatPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'bat';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    const unicastEvents: PowerResult['unicastEvents'] = [];

    for (const [id, p] of room.players.entries()) {
      if (id !== sourcePlayer.deviceId) {
        p.activeEffects.push('bat_blindness_active');
        
        unicastEvents.push({
          socketId: p.socketId,
          event: 'power_blindness',
          data: { durationMs: 6000, by: sourcePlayer.name }
        });
      }
    }

    return {
      success: true,
      message: '¡Ecolocalización activada!',
      unicastEvents
    };
  }
}
