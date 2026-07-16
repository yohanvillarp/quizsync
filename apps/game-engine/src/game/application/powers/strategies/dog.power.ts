import { BadRequestException } from '@nestjs/common';
import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class DogPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'dog';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    if (!targetPlayer) throw new BadRequestException('Perro requiere un compañero');
    
    sourcePlayer.activeEffects.push(`loyalty_active_for_${payload?.targetId}`);
    targetPlayer.activeEffects.push(`loyalty_recipient_from_${payload?.sourceId}`);

    return {
      success: true,
      broadcastEvents: [],
      unicastEvents: []
    };
  }
}
