import { BadRequestException } from '@nestjs/common';
import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class FoxPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'fox';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    if (!targetPlayer) throw new BadRequestException('Zorro requiere un objetivo');
    
    targetPlayer.activeEffects.push(`thief_target_by_${payload?.sourceId}`);
    sourcePlayer.activeEffects.push(`thief_active_on_${payload?.targetId}`);

    return {
      success: true,
      broadcastEvents: [],
      unicastEvents: []
    };
  }
}
