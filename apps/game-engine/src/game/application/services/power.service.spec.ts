import { BadRequestException } from '@nestjs/common';
import { PowerService } from './power.service';
import type { RoomState, Player } from './game.service';
import type { IPowerStrategy } from '../../domain/powers/power.strategy';

// Mockeamos la configuración de modos de juego para controlar
// en cada prueba si los poderes están habilitados o no,
// sin depender de la configuración real del sistema.
jest.mock('@/game/domain/models/game-mode', () => ({
  GAME_MODES: {
    modo_con_poderes: { features: { powersEnabled: true } },
    modo_sin_poderes: { features: { powersEnabled: false } },
  },
}));

describe('PowerService', () => {
  let service: PowerService;

  // Función auxiliar para crear un jugador de prueba con valores
  // por defecto, permitiendo sobreescribir solo lo necesario en cada test.
  const createPlayer = (overrides: Partial<Player> = {}): Player =>
    ({
      deviceId: 'device-1',
      name: 'Jugador de prueba',
      avatarId: 'test-avatar',
      powerStatus: 'AVAILABLE',
      activeEffects: [],
      score: 0,
      ...overrides,
    }) as Player;

  // Función auxiliar para crear una sala de prueba.
  const createRoom = (overrides: Partial<RoomState> = {}): RoomState =>
    ({
      status: 'QUESTION',
      gameModeId: 'modo_con_poderes',
      players: new Map(),
      ...overrides,
    }) as RoomState;

  beforeEach(() => {
    service = new PowerService();
  });

  describe('activatePower', () => {
    it('debería rechazar la activación si la sala no está en estado QUESTION', () => {
      const room = createRoom({ status: 'LOBBY' as any });
      const sourcePlayer = createPlayer();
      room.players.set('source-1', sourcePlayer);

      expect(() =>
        service.activatePower(room, { roomId: 'room-1', sourceId: 'source-1' }),
      ).toThrow(BadRequestException);

      expect(() =>
        service.activatePower(room, { roomId: 'room-1', sourceId: 'source-1' }),
      ).toThrow('Los poderes solo se pueden usar durante una pregunta activa');
    });

    it('debería rechazar la activación si los poderes están deshabilitados en el modo de juego', () => {
      const room = createRoom({ gameModeId: 'modo_sin_poderes' });
      const sourcePlayer = createPlayer();
      room.players.set('source-1', sourcePlayer);

      expect(() =>
        service.activatePower(room, { roomId: 'room-1', sourceId: 'source-1' }),
      ).toThrow('Los poderes están deshabilitados en este modo de juego');
    });

    it('debería rechazar la activación si el jugador ya usó su poder', () => {
      const room = createRoom();
      const sourcePlayer = createPlayer({ powerStatus: 'USED' as any });
      room.players.set('source-1', sourcePlayer);

      expect(() =>
        service.activatePower(room, { roomId: 'room-1', sourceId: 'source-1' }),
      ).toThrow('El poder ya fue utilizado');
    });

    it('debería rechazar la activación si el jugador está silenciado por el Gallo', () => {
      const room = createRoom();
      const sourcePlayer = createPlayer({ activeEffects: ['silenced_by_gallo_2'] });
      room.players.set('source-1', sourcePlayer);

      expect(() =>
        service.activatePower(room, { roomId: 'room-1', sourceId: 'source-1' }),
      ).toThrow('Estás silenciado por el Gallo en esta ronda');
    });

    it('debería activar el poder correctamente cuando todas las condiciones son válidas', () => {
      // Registramos una estrategia de prueba para no depender de las
      // estrategias reales (Zorro, Búho, Dragón, etc.), manteniendo
      // la prueba unitaria y aislada.
      const mockStrategy: IPowerStrategy = {
        avatarId: 'test-avatar',
        activate: jest.fn().mockReturnValue({
          success: true,
          message: 'Poder de prueba activado',
        }),
      } as unknown as IPowerStrategy;

      service.registerStrategy(mockStrategy);

      const room = createRoom();
      const sourcePlayer = createPlayer({ avatarId: 'test-avatar' });
      room.players.set('source-1', sourcePlayer);

      const result = service.activatePower(room, {
        roomId: 'room-1',
        sourceId: 'source-1',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Poder de prueba activado');
      expect(sourcePlayer.powerStatus).toBe('USED');
      expect(mockStrategy.activate).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculatePointsModifier', () => {
    it('no debería aplicar ningún modificador de puntos si los poderes están deshabilitados', () => {
      const room = createRoom({ gameModeId: 'modo_sin_poderes' });
      const player = createPlayer();

      const result = service.calculatePointsModifier(
        room,
        player,
        500, // basePoints
        3000, // timeTakenMs
        true, // isCorrect
      );

      expect(result).toEqual({ basePoints: 500, powerPoints: 0 });
    });
  });
});