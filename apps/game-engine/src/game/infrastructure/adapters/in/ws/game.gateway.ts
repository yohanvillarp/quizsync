import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameService, Question } from '@/game/application/services/game.service';
import { PowerService } from '@/game/application/services/power.service';
import type { ApiCoreQuiz } from '@/game/domain/models/api-core.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private questionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private lastEmoteTime: Map<string, number> = new Map();
  private readonly EMOTE_COOLDOWN_MS = 800;
  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameService: GameService,
    private readonly powerService: PowerService
  ) {
    this.gameService.roomDestroyed$.subscribe(({ roomId, message }) => {
      this.server?.to(roomId).emit('room_destroyed', {
        roomId,
        message
      });
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const result = this.gameService.handleDisconnect(client.id);
    
    if (result) {
      const { room, player } = result;
      
      // Notificar temporalmente que el jugador se desconectó (opcional, para UI)
      this.server.to(room.roomId).emit('player_updated', {
        roomId: room.roomId,
        players: Array.from(room.players.values())
      });

      // Esperar 20 segundos antes de remover definitivamente para permitir recargas
      setTimeout(() => {
        const removeResult = this.gameService.removePlayerDefinitively(room.roomId, player.deviceId);
        
        if (removeResult) {
          const { room: updatedRoom, destroyed } = removeResult;
          
          if (destroyed) {
            this.server.to(updatedRoom.roomId).emit('room_destroyed', {
              roomId: updatedRoom.roomId,
              message: 'El creador de la sala se ha desconectado.'
            });
          } else {
            this.server.to(updatedRoom.roomId).emit('player_left', {
              deviceId: player.deviceId,
              players: Array.from(updatedRoom.players.values())
            });
          }
        }
      }, 20000);
    }
  }

  @SubscribeMessage('use_power')
  handleUsePower(
    @MessageBody() payload: { roomId: string; sourceId: string; targetId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const room = this.gameService.getRoom(payload.roomId);
      if (!room) {
        client.emit('error', { message: 'Sala no encontrada' });
        return;
      }
      
      const result = this.powerService.activatePower(room, payload);
      
      // Update clients
      if (result.broadcastEvents) {
        result.broadcastEvents.forEach(evt => {
          this.server.to(payload.roomId).emit(evt.event, evt.data);
        });
      }
      if (result.unicastEvents) {
        result.unicastEvents.forEach(evt => {
          this.server.to(evt.socketId).emit(evt.event, evt.data);
        });
      }

      // Sync room state with clients after applying power effects
      this.server.to(payload.roomId).emit('room_state', { room });
    } catch (error: any) {
      this.logger.error(`Error activating power: ${error.message}`);
      client.emit('error', { message: error.message || 'Error activando el poder' });
    }
  }

  @SubscribeMessage('player_action')
  handlePlayerAction(
    @MessageBody() payload: { roomId: string; actionType: string; senderId: string; targetId?: string; payload?: string }
  ) {
    if (payload.actionType === 'emote') {
      // Rate limiting server-side contra sobrecarga de emojis
      const now = Date.now();
      const lastTime = this.lastEmoteTime.get(payload.senderId) || 0;
      if (now - lastTime < this.EMOTE_COOLDOWN_MS) return;
      this.lastEmoteTime.set(payload.senderId, now);

      try {
        const room = this.gameService.getRoom(payload.roomId);

        // Si solo hay un jugador, los emojis no tienen sentido
        if (room.players.size <= 1) return;

        const player = room.players.get(payload.senderId);
        // Si el jugador está silenciado, no propagamos la acción
        if (player && player.emotesMuted) return;
      } catch (e) {
        return;
      }
    }
    // Retransmitimos la acción a todos en la sala sin guardar estado
    this.server.to(payload.roomId).emit('player_action_received', payload);
  }

  @SubscribeMessage('toggle_emotes')
  handleToggleEmotes(@MessageBody() payload: { roomId: string; hostId: string; targetId: string }) {
    const room = this.gameService.toggleEmotesMuted(payload.roomId, payload.hostId, payload.targetId);
    if (room) {
      this.server.to(payload.roomId).emit('player_updated', {
        roomId: payload.roomId,
        players: Array.from(room.players.values())
      });
    }
  }

  @SubscribeMessage('change_avatar')
  handleChangeAvatar(@MessageBody() payload: { roomId: string; deviceId: string; avatarId: string }) {
    const room = this.gameService.updatePlayerAvatar(payload.roomId, payload.deviceId, payload.avatarId);
    if (room) {
      this.server.to(payload.roomId).emit('player_updated', {
        roomId: payload.roomId,
        players: Array.from(room.players.values())
      });
    }
  }

  @SubscribeMessage('transfer_host')
  handleTransferHost(@MessageBody() payload: { roomId: string; currentHostId: string; targetId: string }) {
    const room = this.gameService.transferHost(payload.roomId, payload.currentHostId, payload.targetId);
    if (room) {
      this.server.to(payload.roomId).emit('player_updated', {
        roomId: payload.roomId,
        players: Array.from(room.players.values())
      });
    }
  }

  @SubscribeMessage('kick_player')
  handleKickPlayer(@MessageBody() payload: { roomId: string; hostId: string; targetId: string }) {
    const result = this.gameService.kickPlayer(payload.roomId, payload.hostId, payload.targetId);
    if (result) {
      const { room, socketIdToKick } = result;
      // Notificamos específicamente al jugador expulsado
      this.server.to(socketIdToKick).emit('you_were_kicked');
      // Desconectamos el socket del expulsado
      const clientSocket = this.server.sockets.sockets.get(socketIdToKick);
      if (clientSocket) {
        clientSocket.disconnect(true);
      }
      // Notificamos a la sala que la lista de jugadores ha cambiado
      this.server.to(payload.roomId).emit('player_left', {
        roomId: payload.roomId,
        players: Array.from(room.players.values())
      });
    }
  }

  @SubscribeMessage('ban_player')
  handleBanPlayer(@MessageBody() payload: { roomId: string; hostId: string; targetId: string }) {
    const result = this.gameService.banPlayer(payload.roomId, payload.hostId, payload.targetId);
    if (result) {
      const { room, socketIdToBan } = result;
      // Notificamos específicamente al jugador vetado
      this.server.to(socketIdToBan).emit('you_were_banned');
      // Desconectamos el socket
      const clientSocket = this.server.sockets.sockets.get(socketIdToBan);
      if (clientSocket) {
        clientSocket.disconnect(true);
      }
      // Notificamos a la sala que la lista de jugadores ha cambiado
      this.server.to(payload.roomId).emit('player_left', {
        roomId: payload.roomId,
        players: Array.from(room.players.values())
      });
    }
  }

  @SubscribeMessage('check_room')
  handleCheckRoom(@MessageBody() payload: { roomId: string; deviceId?: string }) {
    try {
      const room = this.gameService.getRoom(payload.roomId);
      if (payload.deviceId && room.bannedDeviceIds.has(payload.deviceId)) {
        return { exists: true, isBanned: true };
      }
      return { exists: true, isBanned: false };
    } catch {
      return { exists: false, isBanned: false };
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() payload: { roomId: string; deviceId: string }) {
    const removeResult = this.gameService.removePlayerDefinitively(payload.roomId, payload.deviceId, true);
    if (removeResult) {
      const { room: updatedRoom, destroyed } = removeResult;
      if (destroyed) {
        this.server.to(updatedRoom.roomId).emit('room_destroyed', {
          roomId: updatedRoom.roomId,
          message: 'La sala ha sido destruida.'
        });
      } else {
        this.server.to(updatedRoom.roomId).emit('player_left', {
          deviceId: payload.deviceId,
          players: Array.from(updatedRoom.players.values())
        });
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; name: string; avatarId: string; deviceId: string }
  ) {
    try {
      if (!payload.deviceId) throw new Error("deviceId requerido");

      const room = this.gameService.addPlayerToRoom(payload.roomId, client.id, payload.name, payload.avatarId, payload.deviceId);
      const myPlayer = room.players.get(payload.deviceId);
      
      client.join(payload.roomId);
      
      // Enviar a toda la sala la lista actualizada
      this.server.to(payload.roomId).emit('player_joined', {
        roomId: payload.roomId,
        players: Array.from(room.players.values())
      });

      let safeQuestion: any = null;
      if (room.status === 'QUESTION' && room.questions && room.questions.length > room.currentQuestionIndex) {
        const currentQ = room.questions[room.currentQuestionIndex];
        safeQuestion = {
          id: currentQ.id,
          text: currentQ.text,
          timeLimit: currentQ.timeLimit,
          options: currentQ.options.map(o => ({ id: o.id, text: o.text }))
        };
      }

      return { 
        status: 'success', 
        roomId: payload.roomId, 
        isHost: myPlayer?.isHost || false, 
        categoryName: room.categoryName,
        gameModeId: room.gameModeId,
        gameStatus: room.status,
        currentQuestionIndex: room.currentQuestionIndex,
        endTime: room.currentEndTime,
        currentQuestion: safeQuestion
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('destroy_room')
  handleDestroyRoom(@MessageBody() payload: { roomId: string; hostId: string }) {
    try {
      const room = this.gameService.getRoom(payload.roomId);
      // Validar que quien solicita destruir es el host de la sala
      if (room.hostId !== payload.hostId) return;

      this.server.to(payload.roomId).emit('room_destroyed', { message: 'La sala ha sido cerrada por el Host.' });
      this.server.socketsLeave(payload.roomId);
      // Usar destroyRoom del servicio para limpiar rooms Y activeHosts correctamente
      this.gameService.destroyRoom(payload.roomId);
    } catch {
      // La sala ya no existe, no hay nada que destruir
    }
  }

  @SubscribeMessage('start_game')
  handleStartGame(@MessageBody() payload: { roomId: string; hostId: string }) {
    const room = this.gameService.startGame(payload.roomId, payload.hostId);
    if (room) {
      this.server.to(payload.roomId).emit('game_started', {
        status: room.status,
        endTime: room.currentEndTime,
        currentQuestionIndex: room.currentQuestionIndex,
      });

      this.runGameLoop(payload.roomId);
    }
  }

  private runGameLoop(roomId: string) {
    // El servidor controla el tiempo: tras PREPARING, pasa a QUESTION
    setTimeout(() => {
      const qRoom = this.gameService.startQuestion(roomId);
      if (qRoom) {
        const currentQ = qRoom.questions[qRoom.currentQuestionIndex];
        // Enviamos la pregunta SIN la respuesta correcta
        const safeQuestion = {
          id: currentQ.id,
          text: currentQ.text,
          timeLimit: currentQ.timeLimit,
          options: currentQ.options.map(o => ({ id: o.id, text: o.text })) // No enviamos isCorrect
        };
        this.server.to(roomId).emit('question_started', {
          status: qRoom.status,
          gameModeId: qRoom.gameModeId,
          question: safeQuestion,
          endTime: qRoom.currentEndTime,
        });

        // Tras el tiempo de la pregunta, mostramos el RANKING
        const timeoutId = setTimeout(() => {
          this.triggerRankingPhase(roomId);
        }, currentQ.timeLimit * 1000);
        
        this.questionTimeouts.set(roomId, timeoutId);
      }
    }, 4000);
  }

  private triggerRankingPhase(roomId: string) {
    const existingTimeout = this.questionTimeouts.get(roomId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.questionTimeouts.delete(roomId);
    }

    try {
      const room = this.gameService.getRoom(roomId);
      const isLastQuestion = room.currentQuestionIndex >= room.questions.length - 1;
      
      if (isLastQuestion) {
        // En la última pregunta saltamos directo al final para crear suspenso
        const nRoom = this.gameService.nextQuestion(roomId);
        if (nRoom && nRoom.status === 'FINISHED') {
          this.server.to(roomId).emit('game_finished', {
            status: nRoom.status,
            players: Array.from(nRoom.players.values()).sort((a, b) => b.score - a.score),
            categoryName: nRoom.categoryName
          });
        }
        return;
      }
    } catch {
      return;
    }

    const rRoom = this.gameService.showRanking(roomId);
    if (rRoom) {
      this.server.to(roomId).emit('show_ranking', {
        status: rRoom.status,
        endTime: rRoom.currentEndTime,
        players: Array.from(rRoom.players.values())
      });

      // Tras el RANKING, pasamos a la siguiente pregunta (o fin)
      setTimeout(() => {
        const nRoom = this.gameService.nextQuestion(roomId);
        if (nRoom) {
          if (nRoom.status === 'FINISHED') {
            this.server.to(roomId).emit('game_finished', {
              status: nRoom.status,
              players: Array.from(nRoom.players.values()).sort((a, b) => b.score - a.score),
              categoryName: nRoom.categoryName
            });
          } else {
            // Si hay otra pregunta, emitimos el evento y continuamos el loop sin reiniciar el índice
            this.server.to(roomId).emit('game_started', {
              status: nRoom.status,
              endTime: nRoom.currentEndTime,
              currentQuestionIndex: nRoom.currentQuestionIndex,
            });
            this.runGameLoop(roomId);
          }
        }
      }, 5000);
    }
  }

  @SubscribeMessage('submit_answer')
  handleSubmitAnswer(@MessageBody() payload: { roomId: string; deviceId: string; answerId: string }) {
    const result = this.gameService.submitAnswer(payload.roomId, payload.deviceId, payload.answerId);
    if (result) {
      if (this.gameService.allPlayersAnswered(payload.roomId)) {
        this.triggerRankingPhase(payload.roomId);
      }
      
      try {
        const room = this.gameService.getRoom(payload.roomId);
        for (const player of room.players.values()) {
          // Si alguien lanzó "Ladrón" o "Lealtad" hacia el jugador que acaba de responder
          if (
            player.activeEffects.includes(`thief_active_on_${payload.deviceId}`) ||
            player.activeEffects.includes(`loyalty_active_for_${payload.deviceId}`)
          ) {
            const spectatorSocketId = player.socketId;
            if (spectatorSocketId) {
              this.server.to(spectatorSocketId).emit('thief_target_answered', { answerId: payload.answerId });
            }
          }
          
          // También al revés: Si el jugador que acaba de responder es el PERRO, debe pasarle la pista al que recibe la lealtad
          // Buscar si el que respondió tiene activo loyalty_active_for_X
          const loyaltyEffect = player.activeEffects.find(e => e.startsWith('loyalty_active_for_'));
          if (loyaltyEffect && player.deviceId === payload.deviceId) {
             const targetId = loyaltyEffect.replace('loyalty_active_for_', '');
             const targetPlayer = room.players.get(targetId);
             if (targetPlayer && targetPlayer.socketId) {
               this.server.to(targetPlayer.socketId).emit('thief_target_answered', { answerId: payload.answerId });
             }
          }
        }
      } catch (e) {
        // Ignorar si hay error al buscar sala
      }

      // Opcional: Solo enviamos confirmación al jugador, no a todos para evitar lag/spoilers
      return { status: 'success', points: result.points, isCorrect: result.isCorrect };
    }
    return { status: 'error' };
  }

  @SubscribeMessage('return_to_lobby')
  handleReturnToLobby(@MessageBody() payload: { roomId: string; hostId: string }) {
    const room = this.gameService.resetRoomToLobby(payload.roomId, payload.hostId);
    if (room) {
      this.server.to(payload.roomId).emit('room_reset_to_lobby', {
        status: room.status,
        players: Array.from(room.players.values())
      });
      return { status: 'success' };
    }
    return { status: 'error', message: 'No autorizado o sala no encontrada' };
  }

  @SubscribeMessage('update_category')
  async handleUpdateCategory(@MessageBody() payload: { roomId: string; hostId: string; categoryId: string }) {
    try {
      const apiCoreUrl = process.env.API_CORE_URL || 'http://localhost:3000/api';
      const fetchUrl = payload.categoryId && payload.categoryId !== 'random' 
        ? `${apiCoreUrl}/quizzes?categoryId=${payload.categoryId}` 
        : `${apiCoreUrl}/quizzes`;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error('Error al conectar con ApiCore');
      
      const allQuizzes: ApiCoreQuiz[] = await res.json();
      // Filter quizzes by category, or use all if random
      let filteredQuizzes: ApiCoreQuiz[] = [];
      let categoryName = 'Trivia Mixta';

      if (payload.categoryId === 'random' || !payload.categoryId) {
        filteredQuizzes = allQuizzes;
      } else {
        filteredQuizzes = allQuizzes.filter((q) => q.categoryId === payload.categoryId);
        if (filteredQuizzes.length > 0) {
          categoryName = filteredQuizzes[0].category?.name || 'Categoría Libre';
        } else {
          filteredQuizzes = allQuizzes; // fallback si la categoria no se encuentra
        }
      }

      if (filteredQuizzes.length === 0) {
        throw new Error('No hay quizzes disponibles en la base de datos');
      }

      // Collect all questions from all filtered quizzes
      let allQuestions: Question[] = [];
      for (const quiz of filteredQuizzes) {
        const mapped = quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          timeLimit: q.timeLimit || 15,
          options: q.options.map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect
          }))
        }));
        allQuestions = allQuestions.concat(mapped);
      }

      // Shuffle and pick 10
      let questions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

      const room = this.gameService.updateRoomCategory(payload.roomId, payload.hostId, categoryName, questions);
      
      if (room) {
        this.server.to(payload.roomId).emit('category_updated', { categoryName: room.categoryName });
        return { status: 'success', categoryName: room.categoryName };
      }
      return { status: 'error', message: 'No autorizado o sala no encontrada' };
    } catch (error) {
      this.logger.error(error);
      return { status: 'error', message: error.message };
    }
  }
}
