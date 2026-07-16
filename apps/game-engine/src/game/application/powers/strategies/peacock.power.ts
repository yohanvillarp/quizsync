import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class PeacockPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'peacock';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    const unicastEvents: PowerResult['unicastEvents'] = [];

    for (const [id, p] of room.players.entries()) {
      if (id !== sourcePlayer.deviceId) {
        p.activeEffects.push('peacock_illusion_active');
        
        unicastEvents.push({
          socketId: p.socketId,
          event: 'power_illusion_shuffle',
          data: { by: sourcePlayer.name }
        });
      }
    }

    return {
      success: true,
      message: '¡Ilusión activada!',
      unicastEvents
    };
  }
}
