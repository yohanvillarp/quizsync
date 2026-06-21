import { Injectable } from '@nestjs/common';
import { IGameRepository } from '../../../../domain/ports/out/game.repository';
import { GameSessionModel, PlayerModel } from '../../../../domain/models/game-session.model';
import { RedisService } from '../../../../../infrastructure/redis/redis.service';

@Injectable()
export class RedisGameRepository implements IGameRepository {
  private readonly PREFIX = 'game:';

  constructor(private readonly redisService: RedisService) {}

  async saveSession(session: GameSessionModel): Promise<void> {
    const key = `${this.PREFIX}${session.roomId}`;
    // Guardamos en memoria con expiración de 2 horas (por si se queda colgado)
    await this.redisService.getClient().setEx(key, 7200, JSON.stringify(session));
  }

  async getSession(roomId: string): Promise<GameSessionModel | null> {
    const key = `${this.PREFIX}${roomId}`;
    const data = await this.redisService.getClient().get(key);
    
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // Mapeamos de vuelta al modelo de dominio rico
    const session = new GameSessionModel(
      parsed.roomId,
      parsed.quizId,
      parsed.name || 'Sala de Juego',
      parsed.isPublic || false,
      parsed.maxPlayers || 8,
      parsed.gameMode || 'NORMAL',
      [],
      parsed.spectators ? parsed.spectators.map((s: any) => new PlayerModel(s.socketId, s.nickname, s.avatarId, s.score)) : [],
      parsed.status,
      parsed.currentQuestionIndex
    );
    session.players = parsed.players ? parsed.players.map((p: any) => new PlayerModel(p.socketId, p.nickname, p.avatarId, p.score)) : [];
    
    return session;
  }

  async deleteSession(roomId: string): Promise<void> {
    const key = `${this.PREFIX}${roomId}`;
    await this.redisService.getClient().del(key);
  }
}
