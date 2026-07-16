import { BadRequestException } from '@nestjs/common';
import type { IPowerStrategy } from '../../../domain/powers/power.strategy';
import type { RoomState, Player } from '../../services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../services/power.service';

export class GalloPowerStrategy implements IPowerStrategy {
  readonly avatarId = 'gallo';

  activate(room: RoomState, sourcePlayer: Player, targetPlayer?: Player, payload?: PowerActivationPayload): PowerResult {
    const result: PowerResult = {
      success: true,
      broadcastEvents: [],
      unicastEvents: []
    };

    // Rey del Gallinero: No puede silenciar a otros gallos.
    // Si ya hay jugadores silenciados, cantar rompe el silencio y restaura poderes.
    let someoneWasSilenced = false;
    
    for (const p of room.players.values()) {
      if (p.activeEffects.some(e => e.startsWith('silenced_by_gallo'))) {
        someoneWasSilenced = true;
        break;
      }
    }

    if (someoneWasSilenced) {
      // Si había silenciados, este canto los libera
      for (const p of room.players.values()) {
        if (p.activeEffects.some(e => e.startsWith('silenced_by_gallo'))) {
          p.activeEffects = p.activeEffects.filter(e => !e.startsWith('silenced_by_gallo'));
          result.unicastEvents!.push({
            socketId: p.socketId,
            event: 'power_restored',
            data: { by: sourcePlayer.name }
          });
        }
      }
    } else {
      // Si no había nadie silenciado, aplicamos el silencio a los NO gallos y anulamos sus poderes activos
      for (const [id, p] of room.players.entries()) {
        if (id !== payload?.sourceId && p.avatarId !== 'gallo') {
          // Anulamos todos los demás efectos activos de esta ronda (perro, oso, conejo, etc.)
          p.activeEffects = p.activeEffects.filter(e => e.startsWith('silenced_by_gallo'));
          
          // Si ya habían respondido y obtenido puntos de poder, se los quitamos (anulamos el poder)
          if (p.answered && p.lastRoundPowerPoints) {
            p.score -= p.lastRoundPowerPoints;
            p.lastRoundPowerPoints = 0;
            p.lastRoundPowerMessage = undefined;
          }
          
          p.activeEffects.push('silenced_by_gallo_2');
          // Notificamos
          result.unicastEvents!.push({
            socketId: p.socketId,
            event: 'power_silenced',
            data: { by: sourcePlayer.name }
          });
        }
      }
      sourcePlayer.activeEffects.push('gallo_silenced_others');
    }

    return result;
  }
}
