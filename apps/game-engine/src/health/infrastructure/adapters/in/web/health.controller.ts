import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    try {
      // In a real scenario, check Redis connection here if applicable
      return {
        status: 'ok',
        service: 'game-engine',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        error: 'Service degraded',
      });
    }
  }
}
