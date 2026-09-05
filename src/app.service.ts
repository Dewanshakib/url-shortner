import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  root(): string {
    return 'URL Shortener API is working';
  }

  async health() {
    const health = {
      api: 'ok' as string,
      database: 'ok' as string,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      health.database = 'error';
      health.api = 'degraded';
    }

    return health;
  }
}
