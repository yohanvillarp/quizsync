import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { socketClient } from '@/shared/api/ws/socket.client';
import { useAlertStore } from '@/shared/store/useAlertStore';
import type { GameModeId } from './game-mode.types';

export interface Player {
  socketId: string;
  name: string;
  avatarId: string;
  deviceId: string;
  isHost: boolean;
  connected?: boolean;
  score: number;
  answered?: boolean;
  emotesMuted?: boolean;
  powerStatus?: 'AVAILABLE' | 'USED';
  activeEffects?: string[];
  lastRoundScore?: number;
  lastRoundPowerPoints?: number;
  lastRoundPowerMessage?: string;
}

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  timeLimit: number;
  options: Option[];
}

interface GameStartedPayload { status: 'PREPARING'; endTime: number; currentQuestionIndex?: number; }
interface QuestionStartedPayload { status: 'QUESTION'; gameModeId: GameModeId; question: Question; endTime: number; }
interface ShowRankingPayload { status: 'RANKING'; endTime: number; players: Player[]; }
interface GameFinishedPayload { status: 'FINISHED'; players: Player[]; categoryName?: string; }
interface RoomResetPayload { status: 'LOBBY'; players: Player[]; }
interface CategoryUpdatedPayload { categoryName: string; }

interface GameState {
  roomId: string | null;
  players: Player[];
  isHost: boolean;
  isConnected: boolean;
  powerJustRecharged: boolean;
  
  // Estado del juego
  gameStatus: 'LOBBY' | 'PREPARING' | 'QUESTION' | 'RANKING' | 'FINISHED';
  gameModeId: GameModeId;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  endTime: number | null;
  categoryName: string;
  quizDescription?: string;
  removedOptionIds: string[];
  powerAnimations: { sourceId: string; avatarId: string; targetId?: string; timestamp: number }[];
  thiefSuggestedAnswerId: string | null;
  serverTimeOffset: number;
  
  // Acciones
  connect: (url?: string) => void;
  disconnect: () => void;
  joinRoom: (roomId: string, name: string, avatarId: string, deviceId: string) => Promise<{ status: string, isHost?: boolean }>;
  checkRoom: (roomId: string, deviceId?: string) => Promise<{ exists: boolean, isBanned: boolean }>;
  banPlayer: (targetId: string) => void;
  startGame: () => void;
  leaveRoom: () => void;
  submitAnswer: (answerId: string) => Promise<{ status: string, points?: number, isCorrect?: boolean }>;
  kickPlayer: (targetId: string) => void;
  transferHost: (targetId: string) => void;
  changeAvatar: (avatarId: string) => void;
  toggleMuteEmotes: (targetId: string) => void;
  emitEmote: (targetId: string, payload: string) => void;
  clearPowerJustRecharged: () => void;
  emitPoke: (targetId: string) => void;
  returnToLobby: () => Promise<void>;
  updateCategory: (categoryId: string) => Promise<void>;
  destroyRoom: () => void;
  clearGameState: () => void;
  
  // Setters internos para los listeners del socket
  setPlayers: (players: Player[]) => void;
  setConnected: (status: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      // Función para manejar la conexión y auto-reconexión
      const handleConnect = () => {
        set({ isConnected: true });
        // Auto-reconexión silenciosa si tenemos un roomId
        const state = get();
        if (state.roomId) {
          const deviceId = localStorage.getItem('quizsync_device_id');
          const name = localStorage.getItem(`quizsync_player_name_${state.roomId}`);
          if (deviceId && name) {
            const me = state.players.find(p => p.deviceId === deviceId);
            const avatarId = me?.avatarId || 'fox';
            state.joinRoom(state.roomId, name, avatarId, deviceId);
          }
        }
      };

      // Inicializamos listeners globales del socket
      socketClient.on('connect', handleConnect);
      
      // Si el socket ya estaba conectado antes de registrar el evento, forzamos la ejecución
      if (socketClient.connected) {
        handleConnect();
      }

      socketClient.on('pong_time', (data: { clientTime: number; serverTime: number }) => {
        const roundTrip = Date.now() - data.clientTime;
        // La diferencia entre servidor y cliente (servidor puede estar en el futuro = positivo)
        const offset = data.serverTime - data.clientTime - (roundTrip / 2);
        set({ serverTimeOffset: offset });
      });

      socketClient.on('you_were_kicked', () => {
        get().leaveRoom();
        // El enrutamiento y la alerta se manejarán en la UI o donde proceda, pero limpiamos el estado.
      });

      socketClient.on('you_were_banned', () => {
        get().leaveRoom();
      });

      socketClient.on('disconnect', () => set({ isConnected: false }));
  const updatePlayersState = (data: { players: Player[] }) => {
    const state = get();
    let newPlayers = data.players;
    
    // Si la partida terminó (estamos en el Podio o Ranking final), queremos conservar 
    // a los jugadores que se desconectaron o salieron para que sigan apareciendo en la tabla.
    if (state.gameStatus === 'FINISHED') {
      const currentPlayers = [...state.players];
      const incomingMap = new Map(data.players.map(p => [p.deviceId, p]));
      
      newPlayers = currentPlayers.map(p => {
        // Actualizamos con datos nuevos si existen
        if (incomingMap.has(p.deviceId)) {
          return incomingMap.get(p.deviceId)!;
        }
        // Si no existen en los nuevos datos pero la partida terminó, los conservamos
        return p;
      });

      // Añadir cualquier jugador nuevo que haya entrado (poco probable en FINISHED, pero por si acaso)
      data.players.forEach(p => {
        if (!currentPlayers.find(cp => cp.deviceId === p.deviceId)) {
          newPlayers.push(p);
        }
      });
    }

    const deviceId = localStorage.getItem('quizsync_device_id') || '';
    const myPlayer = newPlayers.find(p => p.deviceId === deviceId);
    set({ players: newPlayers, isHost: myPlayer?.isHost || false });
  };

  socketClient.on('player_joined', updatePlayersState);
  socketClient.on('player_left', updatePlayersState);
  socketClient.on('player_updated', updatePlayersState);

  socketClient.on('game_started', (data: GameStartedPayload & { players?: any[] }) => set((state) => ({ 
    gameStatus: data.status, 
    endTime: data.endTime, 
    currentQuestion: null,
    currentQuestionIndex: data.currentQuestionIndex !== undefined ? data.currentQuestionIndex : (state.gameStatus === 'LOBBY' || state.gameStatus === 'FINISHED' ? 0 : state.currentQuestionIndex + 1),
    ...(data.players ? { players: data.players } : {})
  })));
  socketClient.on('question_started', (data: QuestionStartedPayload) => set((state) => ({ 
    gameStatus: data.status, 
    gameModeId: data.gameModeId,    
    currentQuestion: data.question, 
    endTime: data.endTime, 
    removedOptionIds: [],
    thiefSuggestedAnswerId: null,
    players: state.players.map(p => ({ ...p, answered: false }))
  })));
  socketClient.on('show_ranking', (data: ShowRankingPayload) => set({ gameStatus: data.status, endTime: data.endTime, players: data.players }));
  socketClient.on('power_activated', (data: { sourceId: string; avatarId: string; targetId?: string }) => {
    const ts = Date.now();
    set(state => ({
      powerAnimations: [...state.powerAnimations, { ...data, timestamp: ts }]
    }));
    setTimeout(() => {
      set(state => ({
        powerAnimations: state.powerAnimations.filter(p => p.timestamp !== ts)
      }));
    }, 4000); // Remove animation after 4s
  });
  socketClient.on('power_fifty_fifty', (data: { removedOptionIds: string[] }) => {
    set({ removedOptionIds: data.removedOptionIds });
  });
  socketClient.on('thief_target_answered', (data: { answerId: string }) => {
    set({ thiefSuggestedAnswerId: data.answerId });
  });
  socketClient.on('time_update', (data: { endTime: number }) => {
    set({ endTime: data.endTime });
  });
  socketClient.on('player_answered', (data: { deviceId: string; isCorrect: boolean; points: number }) => {
    set(state => ({
      players: state.players.map(p => 
        p.deviceId === data.deviceId 
          ? { ...p, answered: true, lastRoundIsCorrect: data.isCorrect, lastRoundScore: data.points } 
          : p
      )
    }));
  });
  socketClient.on('power_recharged', () => {
    set({ powerJustRecharged: true });
  });
  socketClient.on('power_silenced', () => {
    set(state => {
      const myDeviceId = localStorage.getItem('quizsync_device_id') || '';
      return {
        players: state.players.map(p => 
          p.deviceId === myDeviceId ? { ...p, activeEffects: [...(p.activeEffects || []), 'silenced_by_gallo_2'] } : p
        )
      };
    });
  });
  socketClient.on('power_restored', () => {
    set(state => {
      const myDeviceId = localStorage.getItem('quizsync_device_id') || '';
      return {
        players: state.players.map(p => 
          p.deviceId === myDeviceId ? { ...p, powerStatus: 'AVAILABLE' } : p
        )
      };
    });
  });
  socketClient.on('room_state', (data: { room: any }) => {
    // Sync when powers modify active effects and player status
    // In our implementation room.players is sent as an object/array depending on backend.
    // If it's a map in backend, nestjs sends it as an object or we might need to parse.
    // We already have 'player_updated' or we can just update players array.
    const playersArray = Array.isArray(data.room.players) ? data.room.players : Object.values(data.room.players || {});
    if (playersArray.length > 0) {
      set({ 
        players: playersArray as Player[],
        gameModeId: data.room.gameModeId || 'NORMAL'
      });
    }
  });
  socketClient.on('game_finished', (data: GameFinishedPayload) => set({ 
    gameStatus: data.status, 
    players: data.players, 
    endTime: null, 
    currentQuestion: null,
    categoryName: data.categoryName || get().categoryName,
    thiefSuggestedAnswerId: null
  }));
  
  socketClient.on('room_reset_to_lobby', (data: RoomResetPayload) => {
    const currentRoom = get().roomId;
    if (currentRoom) {
      sessionStorage.removeItem(`podium_played_${currentRoom}`);
    }
    set({
      gameStatus: data.status,
      players: data.players,
      endTime: null,
      currentQuestion: null,
      thiefSuggestedAnswerId: null,
      powerAnimations: [],
      powerJustRecharged: false
    });
  });

  socketClient.on('room_destroyed', (data?: { message?: string }) => {
    if (data?.message) {
      useAlertStore.getState().showAlert(data.message, "Sala Destruida");
    }
    set({
      roomId: null,
      gameStatus: 'LOBBY',
      gameModeId: 'NORMAL',
      players: [],
      currentQuestion: null,
      endTime: null,
      isConnected: true // Mantiene la conexión al socket, pero sale de la sala
    });
  });

  socketClient.on('category_updated', (data: CategoryUpdatedPayload) => set({
    categoryName: data.categoryName
  }));

  return {
    roomId: null,
    players: [],
    isHost: false,
    isConnected: false,
    gameStatus: 'LOBBY',
    gameModeId: 'NORMAL',
    currentQuestion: null,
    currentQuestionIndex: 0,
    endTime: null,
    categoryName: 'Cultura General',
    removedOptionIds: [],
    powerAnimations: [],
    powerJustRecharged: false,
    thiefSuggestedAnswerId: null,
    serverTimeOffset: 0,

    connect: (url) => {
      socketClient.connect(url);
      setTimeout(() => socketClient.emit('ping_time', { clientTime: Date.now() }), 500);
    },

    disconnect: () => {
      socketClient.disconnect();
    },

    joinRoom: (roomId, name, avatarId, deviceId) => {
      return new Promise((resolve) => {
        socketClient.emit('join_room', { roomId, name, avatarId, deviceId }, (response: any) => {
          if (response.status === 'success') {
            set({ 
              roomId, 
              isHost: response.isHost, 
              categoryName: response.categoryName,
              quizDescription: response.quizDescription,
              gameModeId: response.gameModeId || 'NORMAL',
              gameStatus: response.gameStatus || get().gameStatus,
              currentQuestionIndex: response.currentQuestionIndex || 0,
              endTime: response.endTime || null,
              currentQuestion: response.currentQuestion || null,
              thiefSuggestedAnswerId: null
            });
          }
          resolve(response);
        });
      });
    },

    checkRoom: (roomId, deviceId) => {
      return new Promise((resolve) => {
        socketClient.emit('check_room', { roomId, deviceId }, (response: any) => {
          resolve(response);
        });
      });
    },

    startGame: () => {
      const { roomId, isHost } = get();
      if (!roomId || !isHost) return;
      const deviceId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('start_game', { roomId, hostId: deviceId });
    },

    leaveRoom: () => {
      const { roomId } = get();
      if (!roomId) return;
      const deviceId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('leave_room', { roomId, deviceId });
    },

    submitAnswer: (answerId) => {
      return new Promise((resolve) => {
        const { roomId } = get();
        if (!roomId) return resolve({ status: 'error' });
        
        const deviceId = localStorage.getItem('quizsync_device_id') || '';
        socketClient.emit('submit_answer', { roomId, deviceId, answerId }, (response: any) => {
          resolve(response);
        });
      });
    },

    banPlayer: (targetId) => {
      const { roomId, isHost } = get();
      if (!roomId || !isHost) return;
      const deviceId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('ban_player', { roomId, hostId: deviceId, targetId });
    },

    kickPlayer: (targetId) => {
      const { roomId, isHost } = get();
      if (!roomId || !isHost) return;
      const deviceId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('kick_player', { roomId, hostId: deviceId, targetId });
    },

    transferHost: (targetId) => {
      const { roomId, isHost } = get();
      if (!roomId || !isHost) return;
      const deviceId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('transfer_host', { roomId, currentHostId: deviceId, targetId });
    },

    changeAvatar: (avatarId) => {
      const { roomId } = get();
      if (!roomId) return;
      const deviceId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('change_avatar', { roomId, deviceId, avatarId });
    },

    toggleMuteEmotes: (targetId) => {
      const { roomId, isHost } = get();
      if (!roomId || !isHost) return;
      const hostId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('toggle_emotes', { roomId, hostId, targetId });
    },

    emitEmote: (targetId, payload) => {
      const { roomId } = get();
      const senderId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('player_action', { roomId, actionType: 'emote', senderId, targetId, payload });
    },

    clearPowerJustRecharged: () => {
      set({ powerJustRecharged: false });
    },

    emitPoke: (targetId) => {
      const { roomId } = get();
      if (roomId) {
        const senderId = localStorage.getItem('quizsync_device_id') || '';
        socketClient.emit('player_action', { roomId, actionType: 'poke', senderId, targetId });
      }
    },

    returnToLobby: () => {
      return new Promise((resolve, reject) => {
        const { roomId } = get();
        const hostId = localStorage.getItem('quizsync_device_id');
        if (roomId && hostId) {
          socketClient.emit('return_to_lobby', { roomId, hostId }, (response: any) => {
            if (response?.status === 'success') resolve();
            else reject(response?.message || 'Error al volver al lobby');
          });
        } else {
          reject('No hay sala o no eres host');
        }
      });
    },

    updateCategory: (categoryId) => {
      return new Promise((resolve, reject) => {
        const { roomId } = get();
        const hostId = localStorage.getItem('quizsync_device_id');
        if (roomId && hostId) {
          socketClient.emit('update_category', { roomId, hostId, categoryId }, (response: any) => {
            if (response?.status === 'success') resolve();
            else reject('Error al actualizar categoría');
          });
        } else {
          reject('No hay sala o no eres host');
        }
      });
    },

    destroyRoom: () => {
      const { roomId } = get();
      const hostId = localStorage.getItem('quizsync_device_id') || '';
      if (roomId) {
        socketClient.emit('destroy_room', { roomId, hostId });
      }
    },

    clearGameState: () => {
      set({
        roomId: null,
        players: [],
        isHost: false,
        gameStatus: 'LOBBY',
        gameModeId: 'NORMAL',
        currentQuestion: null,
        currentQuestionIndex: 0,
        endTime: null,
        categoryName: '',
        thiefSuggestedAnswerId: null
      });
    },

    setPlayers: (players) => set({ players }),
    setConnected: (status) => set({ isConnected: status }),
  };
}, {
  name: 'quizsync-game-store',
  partialize: (state) => ({ 
    roomId: state.roomId,
    players: state.players,
    isHost: state.isHost,
    gameStatus: state.gameStatus,
    gameModeId: state.gameModeId,
    categoryName: state.categoryName
  })
}));
