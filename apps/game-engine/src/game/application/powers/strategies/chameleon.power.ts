import { BadRequestException } from '@nestjs/common';
import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class ChameleonPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'chameleon';
  
  constructor(private strategyResolver: (avatarId: string) => IPowerStrategy | undefined) {}

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    // Fase 2: Si ya tiene un poder copiado, lo usa
    if (sourcePlayer.copiedAvatarId) {
      const targetStrategy = this.strategyResolver(sourcePlayer.copiedAvatarId);
      if (!targetStrategy) {
        throw new BadRequestException('El poder copiado ya no es válido');
      }

      // Ejecutamos la estrategia copiada
      const copiedAvatarId = sourcePlayer.copiedAvatarId;
      const result = targetStrategy.activate(room, sourcePlayer, targetPlayer, payload);
      
      // Limpiamos el estado después de usarlo
      sourcePlayer.copiedAvatarId = undefined;
      sourcePlayer.activeEffects = sourcePlayer.activeEffects.filter(e => !e.startsWith('chameleon_copied_'));
      
      result.message = `¡Poder mimetizado activado! ${result.message || ''}`;
      result.usedAvatarId = copiedAvatarId;
      return result;
    }

    // Fase 1: Copiar poder
    if (!targetPlayer) {
      throw new BadRequestException('El Camaleón requiere un objetivo para copiar su poder');
    }

    if (targetPlayer.avatarId === 'chameleon') {
      throw new BadRequestException('No puedes copiar a otro Camaleón');
    }

    const targetStrategy = this.strategyResolver(targetPlayer.avatarId);
    
    if (!targetStrategy) {
      throw new BadRequestException('El objetivo no tiene un poder copiable');
    }

    // Guardamos el poder copiado en el estado del jugador
    sourcePlayer.copiedAvatarId = targetPlayer.avatarId;
    sourcePlayer.activeEffects.push(`chameleon_copied_${targetPlayer.avatarId}`);

    return {
      success: true,
      message: `¡Poder copiado! Ahora tienes la habilidad de ${targetPlayer.name}.`,
      suppressDefaultAnimation: true, // We emit our own custom clone animation
      broadcastEvents: [{
        event: 'power_activated',
        data: { sourceId: sourcePlayer.deviceId, avatarId: 'chameleon', targetId: targetPlayer.deviceId, phase: 'clone' }
      }]
    };
  }

  // Delegar también el cálculo de puntos a la estrategia copiada si es necesario
  calculatePointsModifier(room: RoomState, player: Player, basePoints: number, timeTakenMs: number, isCorrect: boolean, maxPoints: number) {
    if (player.copiedAvatarId) {
      const targetStrategy = this.strategyResolver(player.copiedAvatarId);
      
      if (targetStrategy && targetStrategy.calculatePointsModifier) {
        return targetStrategy.calculatePointsModifier(room, player, basePoints, timeTakenMs, isCorrect, maxPoints);
      }
    }
    
    return { powerPoints: 0 };
  }
}
