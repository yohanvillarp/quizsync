import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { PowerService } from './power.service';
import { GAME_CONSTANTS } from '@/game/domain/game.constants';
import { Subject } from 'rxjs';
import { GameModeId } from '@/game/domain/models/game-mode';

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
  powerStatus: 'AVAILABLE' | 'USED';
  activeEffects: string[];
  lastRoundScore?: number;
  lastRoundIsCorrect?: boolean;
  lastRoundPowerPoints?: number;
  lastRoundPowerMessage?: string;
  questionsAnsweredSincePower: number;
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
  maxPoints?: number;
  options: Option[];
}

export type GameStatus = 'LOBBY' | 'PREPARING' | 'QUESTION' | 'RANKING' | 'FINISHED';

export interface RoomState {
  roomId: string;
  quizId: string;
  quizTitle: string;
  quizDescription?: string;
  categoryName: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  gameModeId: GameModeId;
  hostId: string;
  players: Map<string, Player>; // Map by deviceId
  bannedDeviceIds: Set<string>;
  
  // Estado del juego
  status: GameStatus;
  questions: Question[];
  currentQuestionIndex: number;
  currentEndTime: number | null; // Tiempo UNIX en que termina la fase actual
  maxPlayers: number;
}

export interface PublicRoomDto {
  id: string;
  quizTitle: string;
  categoryName: string;
  gameModeId: GameModeId;
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
  private lobbyIdleTimeouts: Map<string, NodeJS.Timeout> = new Map();
  public readonly roomDestroyed$ = new Subject<{roomId: string, message: string}>();

  constructor(
    private readonly powerService: PowerService
  ) {}

  private resetLobbyIdleTimeout(roomId: string): void {
    this.cancelLobbyIdleTimeout(roomId);
    const timeoutId = setTimeout(() => {
      this.destroyRoom(roomId, 'La sala se ha cerrado automáticamente por inactividad.');
    }, GAME_CONSTANTS.LOBBY_IDLE_TIMEOUT_MS);
    this.lobbyIdleTimeouts.set(roomId, timeoutId);
  }

  private cancelLobbyIdleTimeout(roomId: string): void {
    const timeoutId = this.lobbyIdleTimeouts.get(roomId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.lobbyIdleTimeouts.delete(roomId);
    }
  }

  createRoom(
    quizId: string, 
    quizTitle: string,
    quizDescription: string,
    categoryName: string, 
    visibility: 'PUBLIC' | 'PRIVATE', 
    gameModeId: GameModeId,
    hostId: string,
    questions: Question[],
    force: boolean = false,
    maxPlayers: number = 10
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
      quizDescription,
      categoryName,
      visibility,
      gameModeId,
      hostId,
      players: new Map(),
      bannedDeviceIds: new Set(),
      status: 'LOBBY',
      questions: questions,
      currentQuestionIndex: -1,
      currentEndTime: null,
      maxPlayers: maxPlayers || 10,
    });

    this.activeHosts.set(hostId, roomId);

    // Auto-destruir la sala si el host no se une dentro del timeout
    const timeoutId = setTimeout(() => {
      const currentRoom = this.rooms.get(roomId);
      if (currentRoom) {
        const hostJoined = currentRoom.players.has(hostId);
        if (!hostJoined) {
          this.destroyRoom(roomId, 'El creador de la sala nunca se conectó. La sala ha caducado.');
        }
      }
    }, GAME_CONSTANTS.HOST_WAIT_TIMEOUT_MS);
    this.roomCreationTimeouts.set(roomId, timeoutId);

    return roomId;
  }

  destroyRoom(roomId: string, reason: string = 'La sala ha sido cerrada.'): void {
    const room = this.rooms.get(roomId);
    if (room) {
      this.activeHosts.delete(room.hostId);
      this.rooms.delete(roomId);

      const timeoutId = this.roomCreationTimeouts.get(roomId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.roomCreationTimeouts.delete(roomId);
      }
      
      this.cancelLobbyIdleTimeout(roomId);
      
      this.roomDestroyed$.next({ roomId, message: reason });
    }
  }

  getActiveRoomForHost(hostId: string): RoomState | null {
    const roomId = this.activeHosts.get(hostId);
    if (!roomId) return null;
    return this.rooms.get(roomId) || null;
  }

  getPublicRooms(): PublicRoomDto[] {
    const publicRooms: PublicRoomDto[] = [];
    for (const room of this.rooms.values()) {
      if (room.visibility === 'PUBLIC' && room.status === 'LOBBY') {
        publicRooms.push({
          id: room.roomId,
          quizTitle: room.quizTitle,
          categoryName: room.categoryName,
          gameModeId: room.gameModeId,
          playersCount: room.players.size,
          maxPlayers: room.maxPlayers
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
    
    // Validar capacidad máxima si es un nuevo jugador
    if (!room.players.has(deviceId) && room.players.size >= room.maxPlayers) {
      throw new Error(`La sala ya ha alcanzado el límite máximo de ${room.maxPlayers} jugadores.`);
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

    room.players.set(deviceId, { socketId, deviceId, name, avatarId, isHost, connected: true, score: 0, answered: false, emotesMuted: false, powerStatus: 'AVAILABLE', activeEffects: [], questionsAnsweredSincePower: 0 });

    // Cancelar el timeout de auto-destrucción SOLO si el host se une
    if (isHost) {
      const timeoutId = this.roomCreationTimeouts.get(roomId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.roomCreationTimeouts.delete(roomId);
      }
    }

    // Reiniciar timeout de inactividad si seguimos en el Lobby
    if (room.status === 'LOBBY') {
      this.resetLobbyIdleTimeout(roomId);
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

  removePlayerDefinitively(roomId: string, deviceId: string, forceLeave: boolean = false): { room: RoomState, destroyed: boolean } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.get(deviceId);
    if (!player) return null;

    // Solo lo removemos si sigue desconectado (o si es salida forzosa) y la partida no ha terminado (si terminó, lo dejamos para el podio)
    if (!forceLeave) {
      if (player.connected) return null;
      if (room.status === 'FINISHED' && !player.isHost) return null;
    }

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
    if (!room || room.hostId !== hostId) return null;
    
    // Contamos solo a los jugadores que estén actualmente conectados
    const connectedPlayers = Array.from(room.players.values()).filter(p => p.connected);
    if (connectedPlayers.length < 2) return null;

    if (room.status !== 'LOBBY') return null;
    
    this.cancelLobbyIdleTimeout(roomId);
    
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
      player.lastRoundScore = 0;
      player.lastRoundIsCorrect = undefined;
      player.lastRoundPowerPoints = 0;
      player.lastRoundPowerMessage = undefined;
      
      // Lógica de recarga de poderes se maneja en submitAnswer para poder mostrar el mensaje
      // en la pantalla de ranking de esa misma ronda.
      
      this.powerService.applyStartQuestionEffects(player);
    }

    room.currentEndTime = Date.now() + (currentQ.timeLimit * 1000);
    return room;
  }

  showRanking(roomId: string): { room: RoomState, rechargedPlayers: Player[] } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    const rechargedPlayers: Player[] = [];

    const isRechargeRound = (room.currentQuestionIndex + 1) % 5 === 0;

    for (const player of room.players.values()) {
      this.powerService.applyEndQuestionEffects(player);
      
      // Recarga global cada 5 rondas
      if (isRechargeRound && player.powerStatus === 'USED') {
        player.powerStatus = 'AVAILABLE';
        rechargedPlayers.push(player);
      }
    }

    room.status = 'RANKING';
    // 5 segundos mostrando ranking
    room.currentEndTime = Date.now() + 5000;
    return { room, rechargedPlayers };
  }

  nextQuestion(roomId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Limpiar efectos de poder de la ronda anterior
    this.powerService.clearEffects(room);

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

  submitAnswer(roomId: string, deviceId: string, answerId: string): { isCorrect: boolean, points: number, room: RoomState, powerRecharged?: boolean } | null {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'QUESTION') return null;

    const player = room.players.get(deviceId);
    if (!player || player.answered) return null;

    player.answered = true;

    const currentQ = room.questions[room.currentQuestionIndex];
    
    // Check for race condition where timer expired but state hasn't changed yet
    const timeLeft = Math.max(0, (room.currentEndTime || 0) - Date.now());
    if (timeLeft <= 0) {
      return null;
    }

    const option = currentQ.options.find(o => o.id === answerId);
    
    let isCorrect = false;
    let points = 0;
    const timeLimitMs = currentQ.timeLimit * 1000;
    const timeTakenMs = timeLimitMs - timeLeft;
    const maxPoints = currentQ.maxPoints || 1000;

    if (option?.isCorrect) {
      isCorrect = true;
      // Puntaje basado en velocidad (maxPoints, min maxPoints/2 si acierta en el último segundo)
      const timeFactor = timeLeft / timeLimitMs; // De 0 a 1
      points = Math.floor((maxPoints / 2) + ((maxPoints / 2) * timeFactor));
    }
    
    let powerPoints = 0;
    
    const modifierResult = this.powerService.calculatePointsModifier(room, player, points, timeTakenMs, isCorrect, maxPoints);
    points = modifierResult.basePoints;
    powerPoints = modifierResult.powerPoints;

    player.lastRoundScore = points;
    player.lastRoundIsCorrect = isCorrect;
    player.lastRoundPowerPoints = (player.lastRoundPowerPoints || 0) + powerPoints;
    if (modifierResult.message) {
      if (player.lastRoundPowerMessage) {
        player.lastRoundPowerMessage += ` | ${modifierResult.message}`;
      } else {
        player.lastRoundPowerMessage = modifierResult.message;
      }
    }
    player.score += points + powerPoints;

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
    room.currentQuestionIndex = -1;
    // No limpiamos room.questions para permitir jugar de nuevo con la misma categoría
    room.currentEndTime = null;

    // Resetear jugadores
    for (const player of room.players.values()) {
      player.score = 0;
      player.answered = false;
      player.powerStatus = 'AVAILABLE';
      player.activeEffects = [];
      player.questionsAnsweredSincePower = 0;
      player.lastRoundScore = 0;
      player.lastRoundIsCorrect = undefined;
      player.lastRoundPowerPoints = 0;
      player.lastRoundPowerMessage = undefined;
    }

    this.resetLobbyIdleTimeout(roomId);

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
