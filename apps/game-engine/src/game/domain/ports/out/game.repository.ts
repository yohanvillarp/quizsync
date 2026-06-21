import { GameSessionModel } from '../../models/game-session.model';

export const GAME_REPOSITORY = Symbol('GAME_REPOSITORY');

export interface IGameRepository {
  saveSession(session: GameSessionModel): Promise<void>;
  getSession(roomId: string): Promise<GameSessionModel | null>;
  deleteSession(roomId: string): Promise<void>;
}
