import { Inject, Injectable } from '@nestjs/common';
import { GameSessionModel, PlayerModel } from '../../domain/models/game-session.model';
import type { IGameRepository } from '../../domain/ports/out/game.repository';
import { GAME_REPOSITORY } from '../../domain/ports/out/game.repository';
@Injectable()
export class JoinGameService {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: IGameRepository,
  ) {}

  async execute(roomId: string, quizId: string, socketId: string, nickname: string, avatarId: string): Promise<GameSessionModel> {
    let session = await this.gameRepository.getSession(roomId);

    if (!session) {
      // Si no existe la sala, la creamos para este quiz (Regla de negocio temporal)
      session = new GameSessionModel(roomId, quizId);
    }

    const player = new PlayerModel(socketId, nickname, avatarId);
    session.addPlayer(player);

    await this.gameRepository.saveSession(session);

    return session;
  }
}
