import { Module } from '@nestjs/common';
import { GameGateway } from '@/game/infrastructure/adapters/in/ws/game.gateway';
import { GameController } from '@/game/infrastructure/adapters/in/http/game.controller';
import { GameService } from '@/game/application/services/game.service';
import { JoinGameService } from '@/game/application/services/join-game.service';
import { PowerService } from '@/game/application/services/power.service';
import { RedisGameRepository } from '@/game/infrastructure/adapters/out/redis/redis-game.repository';
import { GAME_REPOSITORY } from '@/game/domain/ports/out/game.repository';
import { RedisService } from '@/infrastructure/redis/redis.service';

@Module({
  controllers: [GameController],
  providers: [
    RedisService, // Usualmente en un RedisModule global
    GameGateway,
    GameService,
    JoinGameService,
    PowerService,
    {
      provide: GAME_REPOSITORY,
      useClass: RedisGameRepository, // Inyección de Dependencias Hexagonal
    },
  ],
})
export class GameModule {}
