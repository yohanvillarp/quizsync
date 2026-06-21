import { Injectable, NotFoundException } from '@nestjs/common';
import { GAME_CONSTANTS } from '@/game/domain/game.constants';

export interface Player {
  socketId: string;
  deviceId: string;
  name: string;
  avatarId: string;
  isHost: boolean;
  connected: boolean;
  score: number;
  answered: boolean;
  emotesMuted: boolean;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  timeLimit: number;
  options: Option[];
}

export type GameStatus = 'LOBBY' | 'PREPARING' | 'QUESTION' | 'RANKING' | 'FINISHED';

export interface RoomState {
  roomId: string;
  quizId: string;
  quizTitle: string;
  categoryName: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  hostId: string;
  players: Map<string, Player>; // Map by deviceId
  bannedDeviceIds: Set<string>;
  
  // Estado del juego
  status: GameStatus;
  questions: Question[];
  currentQuestionIndex: number;
  currentEndTime: number | null; // Tiempo UNIX en que termina la fase actual
}

export interface PublicRoomDto {
  id: string;
  quizTitle: string;
  categoryName: string;
  playersCount: number;
  maxPlayers: number;
}

export class RoomAlreadyExistsException extends Error {
  constructor(public previousRoomId: string) {
    super('Ya tienes una sala activa.');
    this.name = 'RoomAlreadyExistsException';
  }
}

@Injectable()
export class GameService {
  private rooms: Map<string, RoomState> = new Map();
  private activeHosts: Map<string, string> = new Map(); // hostId -> roomId
  private roomCreationTimeouts: Map<string, NodeJS.Timeout> = new Map();

  createRoom(
    quizId: string, 
    quizTitle: string, 
    categoryName: string, 
    visibility: 'PUBLIC' | 'PRIVATE', 
    hostId: string,
    questions: Question[],
    force: boolean = false
  ): string {
    const existingRoomId = this.activeHosts.get(hostId);
    if (existingRoomId) {
      if (!force) {
        throw new RoomAlreadyExistsException(existingRoomId);
      }
      // Destruir sala previa si force === true
      this.destroyRoom(existingRoomId);
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    this.rooms.set(roomId, {
      roomId,
      quizId,
      quizTitle,
      categoryName,
      visibility,
      hostId,
      players: new Map(),
      bannedDeviceIds: new Set(),
      status: 'LOBBY',
      questions: questions,
      currentQuestionIndex: -1,
      currentEndTime: null,
    });

    this.activeHosts.set(hostId, roomId);

    // Auto-destruir la sala si nadie se une dentro del timeout
    const timeoutId = setTimeout(() => {
      const currentRoom = this.rooms.get(roomId);
      if (currentRoom && currentRoom.players.size === 0) {
        this.destroyRoom(roomId);
      }
    }, GAME_CONSTANTS.HOST_WAIT_TIMEOUT_MS);
    this.roomCreationTimeouts.set(roomId, timeoutId);

    return roomId;
  }

  destroyRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      this.activeHosts.delete(room.hostId);
      this.rooms.delete(roomId);

      const timeoutId = this.roomCreationTimeouts.get(roomId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.roomCreationTimeouts.delete(roomId);
      }
    }
  }

  getPublicRooms(): PublicRoomDto[] {
    const publicRooms: PublicRoomDto[] = [];
    for (const room of this.rooms.values()) {
      if (room.visibility === 'PUBLIC' && room.status === 'LOBBY') {
        publicRooms.push({
          id: room.roomId,
          quizTitle: room.quizTitle,
          categoryName: room.categoryName,
          playersCount: room.players.size,
          maxPlayers: 10
        });
      }
    }
    return publicRooms;
  }

  getRoom(roomId: string): RoomState {
    const room = this.rooms.get(roomId);
    if (!room) throw new NotFoundException('Sala no encontrada');
    return room;
  }

  addPlayerToRoom(roomId: string, socketId: string, name: string, avatarId: string, deviceId: string): RoomState {
    const room = this.getRoom(roomId);
    
    if (room.bannedDeviceIds.has(deviceId)) {
      throw new Error('Has sido vetado de esta sala.');
    }
    
    // Validar capacidad máxima (10 jugadores) si es un nuevo jugador
    if (!room.players.has(deviceId) && room.players.size >= 10) {
      throw new Error('La sala ya ha alcanzado el límite máximo de 10 jugadores.');
    }
    
    // Reconexión si el deviceId ya existe
    if (room.players.has(deviceId)) {
      const existing = room.players.get(deviceId)!;
      existing.socketId = socketId;
      existing.name = name;
      existing.avatarId = avatarId;
      existing.connected = true;
      return room;
    }

    // El host oficial de la sala es aquel cuyo deviceId coincida con el hostId
    const isHost = room.hostId === deviceId;

    room.players.set(deviceId, { socketId, deviceId, name, avatarId, isHost, connected: true, score: 0, answered: false, emotesMuted: false });

    // Cancelar el timeout de auto-destrucción cuando alguien se une
    const timeoutId = this.roomCreationTimeouts.get(roomId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.roomCreationTimeouts.delete(roomId);
    }

    return room;
  }

  updatePlayerAvatar(roomId: string, deviceId: string, newAvatarId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.get(deviceId);
    if (player) {
      player.avatarId = newAvatarId;
      return room;
    }
    return null;
  }

  transferHost(roomId: string, currentHostId: string, targetId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== currentHostId) return null;

    const currentHost = room.players.get(currentHostId);
    const targetPlayer = room.players.get(targetId);

    if (currentHost && targetPlayer) {
      currentHost.isHost = false;
      targetPlayer.isHost = true;
      room.hostId = targetId;
      return room;
    }
    return null;
  }

  kickPlayer(roomId: string, hostId: string, targetId: string): { room: RoomState, socketIdToKick: string } | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;

    const targetPlayer = room.players.get(targetId);
    if (targetPlayer) {
      const socketIdToKick = targetPlayer.socketId;
      room.players.delete(targetId);
      return { room, socketIdToKick };
    }
    return null;
  }

  banPlayer(roomId: string, hostId: string, targetId: string): { room: RoomState, socketIdToBan: string } | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;

    const targetPlayer = room.players.get(targetId);
    if (targetPlayer) {
      const socketIdToBan = targetPlayer.socketId;
      room.players.delete(targetId);
      room.bannedDeviceIds.add(targetId);
      return { room, socketIdToBan };
    }
    return null;
  }

  toggleEmotesMuted(roomId: string, hostId: string, targetId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;

    const targetPlayer = room.players.get(targetId);
    if (targetPlayer) {
      targetPlayer.emotesMuted = !targetPlayer.emotesMuted;
      return room;
    }
    return null;
  }

  handleDisconnect(socketId: string) {
    for (const [roomId, room] of this.rooms.entries()) {
      for (const [deviceId, player] of room.players.entries()) {
        if (player.socketId === socketId) {
          player.connected = false;
          return { room, player };
        }
      }
    }
    return null;
  }

  removePlayerDefinitively(roomId: string, deviceId: string): { room: RoomState, destroyed: boolean } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.get(deviceId);
    if (!player) return null;

    // Solo lo removemos si sigue desconectado (pudo haberse reconectado durante el timeout)
    if (player.connected) return null;

    room.players.delete(deviceId);
    
    let destroyed = false;
    if (room.players.size === 0 || player.isHost) {
      this.destroyRoom(roomId);
      destroyed = true;
    }
    
    return { room, destroyed };
  }

  // --- Lógica del Flujo de Juego ---

  startGame(roomId: string, hostId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || room.players.size < 2) return null;

    room.status = 'PREPARING';
    room.currentQuestionIndex = 0;
    // 4 segundos de preparación (se enviará el evento y el frontend hará 3, 2, 1)
    room.currentEndTime = Date.now() + 4000;
    
    return room;
  }

  startQuestion(roomId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.status = 'QUESTION';
    const currentQ = room.questions[room.currentQuestionIndex];
    if (!currentQ) return null;

    // Reiniciar estado de respuesta de los jugadores
    for (const player of room.players.values()) {
      player.answered = false;
    }

    room.currentEndTime = Date.now() + (currentQ.timeLimit * 1000);
    return room;
  }

  showRanking(roomId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.status = 'RANKING';
    // 5 segundos mostrando ranking
    room.currentEndTime = Date.now() + 5000;
    return room;
  }

  nextQuestion(roomId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.currentQuestionIndex++;
    if (room.currentQuestionIndex >= room.questions.length) {
      room.status = 'FINISHED';
      room.currentEndTime = null;
    } else {
      room.status = 'PREPARING';
      room.currentEndTime = Date.now() + 4000;
    }
    return room;
  }

  submitAnswer(roomId: string, deviceId: string, answerId: string): { isCorrect: boolean, points: number, room: RoomState } | null {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'QUESTION') return null;

    const player = room.players.get(deviceId);
    if (!player || player.answered) return null;

    player.answered = true;

    const currentQ = room.questions[room.currentQuestionIndex];
    const option = currentQ.options.find(o => o.id === answerId);
    
    let isCorrect = false;
    let points = 0;

    if (option?.isCorrect) {
      isCorrect = true;
      // Puntaje basado en velocidad (max 1000, min 500 si acierta en el último segundo)
      const timeLeft = Math.max(0, (room.currentEndTime || 0) - Date.now());
      const timeLimitMs = currentQ.timeLimit * 1000;
      const timeFactor = timeLeft / timeLimitMs; // De 0 a 1
      points = Math.floor(500 + (500 * timeFactor));
      
      player.score += points;
    }

    return { isCorrect, points, room };
  }

  allPlayersAnswered(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    // Todos los jugadores conectados deben haber respondido
    let allAnswered = true;
    for (const player of room.players.values()) {
      if (player.connected && !player.answered) {
        allAnswered = false;
        break;
      }
    }
    return room.players.size > 0 && allAnswered;
  }

  resetRoomToLobby(roomId: string, hostId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;

    room.status = 'LOBBY';
    room.currentQuestionIndex = 0;
    room.questions = []; // Se limpiarán hasta que el host cambie o inicie con la misma
    room.currentEndTime = null;

    // Resetear jugadores
    for (const player of room.players.values()) {
      player.score = 0;
      player.answered = false;
    }

    return room;
  }

  updateRoomCategory(roomId: string, hostId: string, categoryName: string, questions: Question[]): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;

    room.categoryName = categoryName;
    room.questions = questions;
    return room;
  }
}
