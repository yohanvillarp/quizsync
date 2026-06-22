import { create } from 'zustand';
import { socketClient } from '@/shared/api/ws/socket.client';

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
interface QuestionStartedPayload { status: 'QUESTION'; question: Question; endTime: number; }
interface ShowRankingPayload { status: 'RANKING'; endTime: number; players: Player[]; }
interface GameFinishedPayload { status: 'FINISHED'; players: Player[]; categoryName?: string; }
interface RoomResetPayload { status: 'LOBBY'; players: Player[]; }
interface CategoryUpdatedPayload { categoryName: string; }

interface GameState {
  roomId: string | null;
  players: Player[];
  isHost: boolean;
  isConnected: boolean;
  
  // Estado del juego
  gameStatus: 'LOBBY' | 'PREPARING' | 'QUESTION' | 'RANKING' | 'FINISHED';
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  endTime: number | null;
  categoryName: string;
  
  // Acciones
  connect: (url?: string) => void;
  disconnect: () => void;
  joinRoom: (roomId: string, name: string, avatarId: string, deviceId: string) => Promise<{ status: string, isHost?: boolean }>;
  checkRoom: (roomId: string, deviceId?: string) => Promise<{ exists: boolean, isBanned: boolean }>;
  banPlayer: (targetId: string) => void;
  startGame: () => void;
  submitAnswer: (answerId: string) => Promise<{ status: string, points?: number, isCorrect?: boolean }>;
  kickPlayer: (targetId: string) => void;
  transferHost: (targetId: string) => void;
  changeAvatar: (avatarId: string) => void;
  toggleMuteEmotes: (targetId: string) => void;
  emitEmote: (targetId: string, payload: string) => void;
  emitPoke: (targetId: string) => void;
  returnToLobby: () => Promise<void>;
  updateCategory: (categoryId: string) => Promise<void>;
  destroyRoom: () => void;
  
  // Setters internos para los listeners del socket
  setPlayers: (players: Player[]) => void;
  setConnected: (status: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => {
  // Inicializamos listeners globales del socket
  socketClient.on('connect', () => set({ isConnected: true }));
  socketClient.on('disconnect', () => set({ isConnected: false, roomId: null, players: [], gameStatus: 'LOBBY' }));
  const updatePlayersState = (data: { players: Player[] }) => {
    const deviceId = localStorage.getItem('quizsync_device_id') || '';
    const myPlayer = data.players.find(p => p.deviceId === deviceId);
    set({ players: data.players, isHost: myPlayer?.isHost || false });
  };

  socketClient.on('player_joined', updatePlayersState);
  socketClient.on('player_left', updatePlayersState);
  socketClient.on('player_updated', updatePlayersState);

  socketClient.on('game_started', (data: GameStartedPayload) => set((state) => ({ 
    gameStatus: data.status, 
    endTime: data.endTime, 
    currentQuestion: null,
    currentQuestionIndex: data.currentQuestionIndex !== undefined ? data.currentQuestionIndex : (state.gameStatus === 'LOBBY' || state.gameStatus === 'FINISHED' ? 0 : state.currentQuestionIndex + 1)
  })));
  socketClient.on('question_started', (data: QuestionStartedPayload) => set({ gameStatus: data.status, currentQuestion: data.question, endTime: data.endTime }));
  socketClient.on('show_ranking', (data: ShowRankingPayload) => set({ gameStatus: data.status, endTime: data.endTime, players: data.players }));
  socketClient.on('game_finished', (data: GameFinishedPayload) => set({ 
    gameStatus: data.status, 
    players: data.players, 
    endTime: null, 
    currentQuestion: null,
    categoryName: data.categoryName || get().categoryName
  }));
  
  socketClient.on('room_reset_to_lobby', (data: RoomResetPayload) => set({
    gameStatus: data.status,
    players: data.players,
    endTime: null,
    currentQuestion: null
  }));

  socketClient.on('room_destroyed', () => set({
    roomId: null,
    gameStatus: 'LOBBY',
    players: [],
    currentQuestion: null,
    endTime: null,
    isConnected: true // Mantiene la conexión al socket, pero sale de la sala
  }));

  socketClient.on('category_updated', (data: CategoryUpdatedPayload) => set({
    categoryName: data.categoryName
  }));

  return {
    roomId: null,
    players: [],
    isHost: false,
    isConnected: false,
    gameStatus: 'LOBBY',
    currentQuestion: null,
    currentQuestionIndex: 0,
    endTime: null,
    categoryName: '',

    connect: (url) => {
      socketClient.connect(url);
    },

    disconnect: () => {
      socketClient.disconnect();
    },

    joinRoom: (roomId, name, avatarId, deviceId) => {
      return new Promise((resolve) => {
        socketClient.emit('join_room', { roomId, name, avatarId, deviceId }, (response: any) => {
          if (response.status === 'success') {
            set({ roomId, isHost: response.isHost, categoryName: response.categoryName });
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
      if (!roomId) return;
      const senderId = localStorage.getItem('quizsync_device_id') || '';
      socketClient.emit('player_action', { roomId, actionType: 'emote', senderId, targetId, payload });
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

    setPlayers: (players) => set({ players }),
    setConnected: (status) => set({ isConnected: status }),
  };
});
