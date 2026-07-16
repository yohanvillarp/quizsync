import { Module } from '@nestjs/common';
import { HealthController } from './infrastructure/adapters/in/web/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
