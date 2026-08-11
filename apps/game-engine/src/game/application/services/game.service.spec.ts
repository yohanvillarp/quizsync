import { Test, TestingModule } from '@nestjs/testing';
import { GameService, RoomAlreadyExistsException } from './game.service';
import { PowerService } from './power.service';

describe('GameService - RF-05 (Generar PIN / Código de sala)', () => {
  let service: GameService;
  let powerServiceMock: jest.Mocked<PowerService>;

  beforeEach(async () => {
    powerServiceMock = {
      applyPowerEffect: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: PowerService, useValue: powerServiceMock },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('createRoom (RF-05)', () => {
    const mockQuestions = [
      {
        id: 'q1',
        text: '¿Cuál es la capital de Francia?',
        timeLimit: 30,
        options: [
          { id: 'opt1', text: 'París', isCorrect: true },
          { id: 'opt2', text: 'Madrid', isCorrect: false },
        ],
      },
    ];

    it('debe crear una sala correctamente y retornar un PIN alfanumérico de 6 caracteres', () => {
      const roomId = service.createRoom(
        'quiz-123',
        'Quiz de Prueba',
        'Descripción del quiz',
        'General',
        'PUBLIC',
        'CLASSIC' as any,
        'host-1',
        mockQuestions
      );

      expect(roomId).toBeDefined();
      expect(typeof roomId).toBe('string');
      expect(roomId).toHaveLength(6);
      expect(roomId).toMatch(/^[A-Z0-9]{6}$/);

      const room = service.getRoom(roomId);
      expect(room).toBeDefined();
      expect(room?.quizId).toBe('quiz-123');
      expect(room?.status).toBe('LOBBY');
    });

    it('debe lanzar RoomAlreadyExistsException si el host ya tiene una sala activa y force es false', () => {
      service.createRoom(
        'quiz-123',
        'Quiz 1',
        'Desc 1',
        'General',
        'PUBLIC',
        'CLASSIC' as any,
        'host-1',
        mockQuestions
      );

      expect(() => {
        service.createRoom(
          'quiz-456',
          'Quiz 2',
          'Desc 2',
          'General',
          'PUBLIC',
          'CLASSIC' as any,
          'host-1',
          mockQuestions,
          false
        );
      }).toThrow(RoomAlreadyExistsException);
    });

    it('debe permitir sobreescribir la sala existente si force es true', () => {
      const firstRoomId = service.createRoom(
        'quiz-123',
        'Quiz 1',
        'Desc 1',
        'General',
        'PUBLIC',
        'CLASSIC' as any,
        'host-1',
        mockQuestions
      );

      const secondRoomId = service.createRoom(
        'quiz-456',
        'Quiz 2',
        'Desc 2',
        'General',
        'PUBLIC',
        'CLASSIC' as any,
        'host-1',
        mockQuestions,
        true
      );

      expect(secondRoomId).toBeDefined();
      expect(firstRoomId).not.toBe(secondRoomId);
      expect(() => service.getRoom(firstRoomId)).toThrow();
      expect(service.getRoom(secondRoomId)).toBeDefined();
    });

    it('debe asignar maxPlayers por defecto (20) si no se especifica', () => {
      const roomId = service.createRoom(
        'quiz-123',
        'Quiz 1',
        'Desc 1',
        'General',
        'PUBLIC',
        'CLASSIC' as any,
        'host-1',
        mockQuestions
      );

      const room = service.getRoom(roomId);
      expect(room?.maxPlayers).toBe(20);
    });

    it('debe asignar el valor de maxPlayers proporcionado', () => {
      const roomId = service.createRoom(
        'quiz-123',
        'Quiz 1',
        'Desc 1',
        'General',
        'PUBLIC',
        'CLASSIC' as any,
        'host-1',
        mockQuestions,
        false,
        50
      );

      const room = service.getRoom(roomId);
      expect(room?.maxPlayers).toBe(50);
    });
  });
});