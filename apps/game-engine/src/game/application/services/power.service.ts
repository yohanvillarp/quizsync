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
  usedAvatarId?: string;
  suppressDefaultAnimation?: boolean;
}

import type { IPowerStrategy } from '../../domain/powers/power.strategy';

@Injectable()
export class PowerService {
  private readonly strategies: Map<string, IPowerStrategy> = new Map();

  constructor() {
    // Inyección manual temporal. En un entorno Hexagonal puro, 
    // estos se inyectarían vía un módulo o un provider.
    this.registerStrategy(new (require('../powers/strategies/fox.power').FoxPowerStrategy)());
    this.registerStrategy(new (require('../powers/strategies/owl.power').OwlPowerStrategy)());
    this.registerStrategy(new (require('../powers/strategies/bear.power').BearPowerStrategy)());
    this.registerStrategy(new (require('../powers/strategies/cat.power').CatPowerStrategy)());
    this.registerStrategy(new (require('../powers/strategies/rabbit.power').RabbitPowerStrategy)());
    this.registerStrategy(new (require('../powers/strategies/dog.power').DogPowerStrategy)());
    this.registerStrategy(new (require('../powers/strategies/gallo.power').GalloPowerStrategy)());
    
    // Nuevas Estrategias Míticas y Épicas
    this.registerStrategy(new (require('../powers/strategies/dragon.power').DragonPowerStrategy)());
    this.registerStrategy(new (require('../powers/strategies/bat.power').BatPowerStrategy)());
    this.registerStrategy(new (require('../powers/strategies/peacock.power').PeacockPowerStrategy)());
    
    // Camaleón necesita el resolver de estrategias para copiarlas
    this.registerStrategy(new (require('../powers/strategies/chameleon.power').ChameleonPowerStrategy)(
      (id: string) => this.strategies.get(id)
    ));
  }

  registerStrategy(strategy: IPowerStrategy) {
    this.strategies.set(strategy.avatarId, strategy);
  }

  /**
   * Se ejecuta cuando un usuario presiona el botón de poder.
   */
  activatePower(room: RoomState, payload: PowerActivationPayload): PowerResult {
    if (room.status !== 'QUESTION') {
      throw new BadRequestException('Los poderes solo se pueden usar durante una pregunta activa');
    }

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

    if (sourcePlayer.activeEffects.some(e => e.startsWith('silenced_by_gallo'))) {
      throw new BadRequestException('Estás silenciado por el Gallo en esta ronda');
    }

    let targetPlayer: Player | undefined;
    if (targetId) {
      targetPlayer = room.players.get(targetId);
      if (!targetPlayer) {
        throw new BadRequestException('Objetivo no encontrado');
      }
      
      // Pasiva del Camaleón: Inmune a habilidades hostiles directas
      // Por ahora, solo el zorro ataca directamente a un objetivo.
      if (targetPlayer.avatarId === 'chameleon' && sourcePlayer.avatarId === 'fox') {
        sourcePlayer.powerStatus = 'USED'; // Se gasta el poder
        return {
          success: false,
          message: '¡El Camaleón se camufló y evadió tu ataque!',
          broadcastEvents: [{
            event: 'power_activated',
            data: { sourceId, avatarId: sourcePlayer.avatarId, targetId }
          }],
          unicastEvents: []
        };
      }
    }

    const avatarId = sourcePlayer.avatarId;
    sourcePlayer.powerStatus = 'USED';

    const strategy = this.strategies.get(avatarId);
    
    if (!strategy) {
      throw new BadRequestException('Poder no implementado o avatar sin poder asignado');
    }

    // Ejecutamos la estrategia específica
    const wasChameleonPhase1 = avatarId === 'chameleon' && !sourcePlayer.copiedAvatarId;
    const strategyResult = strategy.activate(room, sourcePlayer, targetPlayer, payload);

    if (wasChameleonPhase1 && sourcePlayer.copiedAvatarId) {
      // Si el Camaleón acaba de clonar un poder (Fase 1), no gastamos su uso
      sourcePlayer.powerStatus = 'AVAILABLE';
    }

    const broadcastEvents: { event: string; data: any }[] = [];
    if (!strategyResult.suppressDefaultAnimation) {
      broadcastEvents.push({
        event: 'power_activated',
        data: { sourceId, avatarId: strategyResult.usedAvatarId || avatarId, targetId }
      });
    }
    if (strategyResult.broadcastEvents) {
      broadcastEvents.push(...strategyResult.broadcastEvents);
    }

    const result: PowerResult = {
      success: strategyResult.success,
      message: strategyResult.message,
      broadcastEvents,
      unicastEvents: strategyResult.unicastEvents || []
    };

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
      const newEffects: string[] = [];
      for (const effect of player.activeEffects) {
        if (effect.startsWith('silenced_by_gallo_')) {
          const duration = parseInt(effect.split('_').pop() || '1', 10);
          if (duration > 1) {
            newEffects.push(`silenced_by_gallo_${duration - 1}`);
          }
        }
      }
      player.activeEffects = newEffects;
    }
  }

  /**
   * Calcula los puntos base y los modificadores de poderes delegando a las estrategias
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

    // Delega el cálculo a TODAS las estrategias que el jugador pueda tener activas 
    // (Por ahora simplificamos buscando la estrategia del avatar actual)
    const strategy = this.strategies.get(player.avatarId);
    if (strategy && strategy.calculatePointsModifier) {
      const modifier = strategy.calculatePointsModifier(room, player, basePoints, timeTakenMs, isCorrect, maxPoints);
      if (modifier) {
        powerPoints += modifier.powerPoints;
        message = modifier.message;
      }
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
