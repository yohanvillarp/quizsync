import type { RoomState, Player } from '../../application/services/game.service';
import type { PowerResult, PowerActivationPayload } from '../../application/services/power.service';

/**
 * Interfaz base para el sistema Hexagonal de Poderes.
 * Siguiendo el principio Open/Closed, permite añadir nuevos poderes
 * sin modificar el PowerService central (Strategy Pattern).
 */
export interface IPowerStrategy {
  /**
   * El ID único del personaje al que pertenece este poder (ej: 'gallo', 'fox')
   */
  readonly avatarId: string;

  /**
   * Ejecuta el efecto inmediato del poder al presionarlo.
   */
  activate(
    room: RoomState, 
    sourcePlayer: Player, 
    targetPlayer?: Player, 
    payload?: PowerActivationPayload
  ): PowerResult;

  /**
   * Hook opcional: Se llama cuando finaliza una pregunta y se calculan los puntos.
   * Retorna los puntos adicionales generados por este poder y un mensaje opcional.
   */
  calculatePointsModifier?(
    room: RoomState, 
    player: Player, 
    basePoints: number, 
    timeTakenMs: number, 
    isCorrect: boolean, 
    maxPoints: number
  ): { powerPoints: number; message?: string };
}
