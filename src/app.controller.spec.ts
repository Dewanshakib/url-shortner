import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let controller: AppController;
  let appService: {
    root: jest.Mock<() => string>;
    health: jest.Mock<() => Promise<any>>;
  };

  beforeEach(async () => {
    appService = {
      root: jest.fn(),
      health: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should delegate to appService.root', async () => {
      appService.root.mockReturnValue('URL Shortener API is working');

      await expect(controller.root()).resolves.toBe(
        'URL Shortener API is working',
      );
      expect(appService.root).toHaveBeenCalled();
    });
  });

  describe('health', () => {
    it('should delegate to appService.health', async () => {
      const health = { api: 'ok', database: 'ok', timestamp: '2026-01-01' };
      appService.health.mockResolvedValue(health);

      await expect(controller.health()).resolves.toEqual(health);
      expect(appService.health).toHaveBeenCalled();
    });
  });
});
