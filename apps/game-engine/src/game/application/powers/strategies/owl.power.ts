import { BadRequestException } from '@nestjs/common';
import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class OwlPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'owl';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    const result: PowerResult = {
      success: true,
      broadcastEvents: [],
      unicastEvents: []
    };

    // 50/50 - Calcular 2 incorrectas y enviarlas solo a este jugador
    const currentQ = room.questions[room.currentQuestionIndex];
    if (currentQ) {
      const incorrectOptions = currentQ.options.filter(o => !o.isCorrect);
      const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
      const removedOptionIds = shuffled.slice(0, 2).map(o => o.id);
      
      result.unicastEvents!.push({
        socketId: sourcePlayer.socketId,
        event: 'power_fifty_fifty',
        data: { removedOptionIds }
      });
    }

    return result;
  }
}
