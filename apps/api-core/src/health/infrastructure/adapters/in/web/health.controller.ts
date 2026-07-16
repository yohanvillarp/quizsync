import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Validate database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        service: 'api-core',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
