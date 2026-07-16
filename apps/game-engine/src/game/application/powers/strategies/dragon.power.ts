import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class DragonPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'dragon';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    const currentQ = room.questions[room.currentQuestionIndex];
    const unicastEvents: PowerResult['unicastEvents'] = [];

    if (currentQ) {
      // Find incorrect options
      const incorrectOptions = currentQ.options.filter(o => !o.isCorrect);
      
      for (const [id, p] of room.players.entries()) {
        if (id !== sourcePlayer.deviceId) {
          // Select a random incorrect option to burn for this player
          const burnedOption = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
          
          p.activeEffects.push('scorched_earth_active');
          
          unicastEvents.push({
            socketId: p.socketId,
            event: 'power_scorched_earth',
            data: { burnedOptionId: burnedOption.id, by: sourcePlayer.name }
          });
        }
      }
    }

    return {
      success: true,
      message: '¡Tierra Calcinada activada!',
      unicastEvents
    };
  }

  calculatePointsModifier(room: RoomState, player: Player, basePoints: number, timeTakenMs: number, isCorrect: boolean, maxPoints: number) {
    if (player.activeEffects.includes('scorched_earth_active') && !isCorrect) {
      // Dragon punishment: lose extra points on wrong answer
      return { powerPoints: -Math.floor(maxPoints * 0.5), message: 'Quemado por el Dragón' };
    }
    return { powerPoints: 0 };
  }
}
