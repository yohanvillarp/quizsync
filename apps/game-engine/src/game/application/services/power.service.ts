import { Injectable, BadRequestException } from '@nestjs/common';
import type { RoomState, Player, Question } from './game.service';
import { GAME_MODES } from '@/game/domain/models/game-mode';

export interface PowerActivationPayload {
  roomId: string;
  sourceId: string;
  targetId?: string;
}

export interface PowerResult {
  success: boolean;
  message?: string;
  broadcastEvents?: { event: string; data: any }[];
  unicastEvents?: { socketId: string; event: string; data: any }[];
}

@Injectable()
export class PowerService {
  /**
   * Se ejecuta cuando un usuario presiona el botón de poder.
   */
  activatePower(room: RoomState, payload: PowerActivationPayload): PowerResult {
    const gameModeConfig = GAME_MODES[room.gameModeId];
    if (!gameModeConfig?.features.powersEnabled) {
      throw new BadRequestException('Los poderes están deshabilitados en este modo de juego');
    }

    const { sourceId, targetId } = payload;
    const sourcePlayer = room.players.get(sourceId);

    if (!sourcePlayer) {
      throw new BadRequestException('Jugador no encontrado');
    }

    if (sourcePlayer.powerStatus === 'USED') {
      throw new BadRequestException('El poder ya fue utilizado');
    }

    let targetPlayer: Player | undefined;
    if (targetId) {
      targetPlayer = room.players.get(targetId);
      if (!targetPlayer) {
        throw new BadRequestException('Objetivo no encontrado');
      }
    }

    const avatarId = sourcePlayer.avatarId;
    sourcePlayer.powerStatus = 'USED';

    const result: PowerResult = {
      success: true,
      broadcastEvents: [],
      unicastEvents: []
    };

    // Broadcast the activation for animations
    result.broadcastEvents!.push({
      event: 'power_activated',
      data: {
        sourceId,
        avatarId,
        targetId
      }
    });

    switch (avatarId) {
      case 'fox':
        if (!targetPlayer) throw new BadRequestException('Zorro requiere un objetivo');
        targetPlayer.activeEffects.push(`thief_target_by_${sourceId}`);
        sourcePlayer.activeEffects.push(`thief_active_on_${targetId}`);
        break;

      case 'owl':
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
        break;

      case 'cat':
        sourcePlayer.activeEffects.push('nine_lives_active');
        break;

      case 'bear':
        sourcePlayer.activeEffects.push('brute_force_active');
        break;

      case 'rabbit':
        sourcePlayer.activeEffects.push('speed_boost_active');
        break;

      case 'dog':
        if (!targetPlayer) throw new BadRequestException('Perro requiere un compañero');
        sourcePlayer.activeEffects.push(`loyalty_active_for_${targetId}`);
        targetPlayer.activeEffects.push(`loyalty_recipient_from_${sourceId}`);
        break;

      default:
        throw new BadRequestException('Avatar sin poder asignado');
    }

    return result;
  }

  /**
   * Se llama al inicio de la pregunta (por si hay efectos que inician aquí).
   */
  applyStartQuestionEffects(player: Player) {
    // Para futuros usos
  }

  /**
   * Se llama al final de la pregunta o cuando se muestran los rankings.
   */
  applyEndQuestionEffects(player: Player) {
    // Para futuros usos
  }

  /**
   * Limpia los efectos temporales al final de la ronda
   */
  clearEffects(room: RoomState) {
    for (const player of room.players.values()) {
      player.activeEffects = [];
    }
  }

  /**
   * Calcula los puntos base y los modificadores de poderes
   */
  calculatePointsModifier(
    room: RoomState,
    player: Player,
    basePoints: number,
    timeTakenMs: number,
    isCorrect: boolean,
    maxPoints: number = 1000
  ): { basePoints: number; powerPoints: number; message?: string } {
    let powerPoints = 0;
    let message: string | undefined = undefined;
    
    const gameModeConfig = GAME_MODES[room.gameModeId];
    if (!gameModeConfig?.features.powersEnabled) {
      return { basePoints, powerPoints: 0 };
    }

    // Bear: x2 on correct, -maxPoints on wrong
    if (player.activeEffects.includes('brute_force_active')) {
      if (isCorrect) {
        powerPoints += basePoints; // Doubled
        message = 'Fuerza Bruta (x2)';
      } else {
        powerPoints -= maxPoints; // Lost max points
        message = `Fallo con Fuerza Bruta (-${maxPoints})`;
      }
    }

    // Rabbit: 1.5x on correct
    if (player.activeEffects.includes('speed_boost_active') && isCorrect) {
      powerPoints += Math.floor(basePoints * 0.5);
      message = 'Bono de Velocidad';
    }

    // Cat: maxPoints/2 points consolation if wrong (mitad de maximo)
    if (player.activeEffects.includes('nine_lives_active') && !isCorrect) {
      powerPoints += Math.floor(maxPoints / 2);
      message = 'Consolación de 7 Vidas';
    }

    // Fox: steal 50% from target (If Fox answers AFTER Target)
    const thiefEffect = player.activeEffects.find(e => e.startsWith('thief_active_on_'));
    if (thiefEffect && isCorrect) {
      const targetId = thiefEffect.split('_').pop();
      if (targetId) {
        const target = room.players.get(targetId);
        // Sólo robamos si el objetivo ya respondió (target.lastRoundScore !== undefined)
        if (target && target.lastRoundScore !== undefined && target.lastRoundScore > 0) {
          const stolen = Math.floor(target.lastRoundScore / 2);
          powerPoints += stolen;
          message = `Robó a ${target.name}`;
          target.lastRoundPowerPoints = (target.lastRoundPowerPoints || 0) - stolen;
          
          if (target.lastRoundPowerMessage) {
            target.lastRoundPowerMessage += ` | Robado por ${player.name}`;
          } else {
            target.lastRoundPowerMessage = `Robado por ${player.name}`;
          }
          
          target.score -= stolen;
        }
      }
    }

    // REVERSE FOX: What if Target answers AFTER Fox?
    for (const thief of room.players.values()) {
      if (thief.activeEffects.includes(`thief_active_on_${player.deviceId}`)) {
        if (thief.answered && thief.lastRoundIsCorrect) {
           const stolen = Math.floor(basePoints / 2);
           thief.lastRoundPowerPoints = (thief.lastRoundPowerPoints || 0) + stolen;
           
           if (thief.lastRoundPowerMessage) {
             thief.lastRoundPowerMessage += ` | Robó a ${player.name}`;
           } else {
             thief.lastRoundPowerMessage = `Robó a ${player.name}`;
           }
           
           thief.score += stolen;
           
           powerPoints -= stolen;
           message = message ? message + ` | Robado por ${thief.name}` : `Robado por ${thief.name}`;
        }
      }
    }

    // Dog: share visual answer only (points sharing removed)
    // We keep this block empty or remove it if no point logic is needed.
    // The visual sharing is handled via websocket events when the Dog answers.

    // REVERSE DOG: If Target answers AFTER Dog, Target already got the points when Dog answered!
    // But what if Dog's shared points depend on Target's points? No, Dog shares Dog's points.
    // So Dog order doesn't matter for the Target receiving points.
    // BUT what if we want to show it? The message is already appended to target.
    // We don't need reverse Dog because Dog is the source of the points.

    return { basePoints, powerPoints, message };
  }
}
