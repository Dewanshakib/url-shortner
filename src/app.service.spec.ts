import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service.js';
import { PrismaService } from './database/prisma.service.js';

describe('AppService', () => {
  let service: AppService;
  let prisma: {
    $queryRaw: jest.Mock<(strings: TemplateStringsArray) => Promise<any>>;
  };

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return the API working message', () => {
      expect(service.root()).toBe('URL Shortener API is working');
    });
  });

  describe('health', () => {
    it('should return ok status when database is healthy', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.health();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result.api).toBe('ok');
      expect(result.database).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });

    it('should return degraded status when database query fails', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

      const result = await service.health();

      expect(result.api).toBe('degraded');
      expect(result.database).toBe('error');
      expect(result.timestamp).toBeDefined();
    });
  });
});
