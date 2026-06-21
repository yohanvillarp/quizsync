import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'GAME-ENGINE 🟠',
        level: 'debug',
        transport: { 
          target: 'pino-pretty', 
          options: { colorize: true, singleLine: true, ignore: 'pid,hostname' } 
        },
      },
    }),
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
