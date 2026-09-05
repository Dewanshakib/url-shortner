import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UrlsService } from './urls.service.js';
import { PrismaService } from '../../database/prisma.service.js';

jest.unstable_mockModule('short-unique-id', () => ({
  default: class {
    randomUUID() {
      return 'abcd1234';
    }
  },
}));

const { UrlsService: UrlsServiceClass } = await import('./urls.service.js');

describe('UrlsService', () => {
  let service: UrlsService;
  let prisma: {
    shortUrl: {
      create: jest.Mock<(args: any) => Promise<any>>;
      findFirst: jest.Mock<(args: any) => Promise<any>>;
      findMany: jest.Mock<(args: any) => Promise<any>>;
      update: jest.Mock<(args: any) => Promise<any>>;
    };
  };
  let config: { get: jest.Mock<(key: string) => string> };

  beforeEach(async () => {
    prisma = {
      shortUrl: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    config = {
      get: jest
        .fn<(key: string) => string>()
        .mockReturnValue('http://localhost:5000/'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsServiceClass,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsServiceClass);
    jest.clearAllMocks();
    config.get.mockReturnValue('http://localhost:5000/');
  });

  describe('generateUrl', () => {
    it('should create a short url and return it with the converted url', async () => {
      const created = {
        id: 1,
        short_id: 'abcd1234',
        redirect_url: 'https://example.com/very-long-url',
        click_count: 0,
        user_id: 7,
      };
      prisma.shortUrl.create.mockResolvedValue(created);

      const result = await service.generateUrl(7, {
        url: 'https://example.com/very-long-url',
      });

      expect(prisma.shortUrl.create).toHaveBeenCalledWith({
        data: {
          short_id: 'abcd1234',
          redirect_url: 'https://example.com/very-long-url',
          user_id: 7,
        },
      });
      expect(result).toEqual({
        ...created,
        shortUrl: 'http://localhost:5000/abcd1234',
      });
    });
  });

  describe('redirectUrl', () => {
    it('should throw NotFoundException for an unknown short id', async () => {
      prisma.shortUrl.findFirst.mockResolvedValue(null);

      await expect(
        service.redirectUrl({ shortId: 'missing1' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.shortUrl.update).not.toHaveBeenCalled();
    });

    it('should increment click count and return redirect target', async () => {
      const shortUrl = {
        id: 3,
        short_id: 'abcd1234',
        redirect_url: 'https://example.com',
        click_count: 4,
      };
      prisma.shortUrl.findFirst.mockResolvedValue(shortUrl);
      prisma.shortUrl.update.mockResolvedValue({
        ...shortUrl,
        click_count: 5,
      });

      const result = await service.redirectUrl({ shortId: 'abcd1234' });

      expect(prisma.shortUrl.findFirst).toHaveBeenCalledWith({
        where: { short_id: 'abcd1234' },
      });
      expect(prisma.shortUrl.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { click_count: { increment: 1 } },
      });
      expect(result).toEqual({
        statusCode: 302,
        url: 'https://example.com',
      });
    });
  });

  describe('urlsByUser', () => {
    it('should return paginated urls for the user', async () => {
      const urls = [
        { id: 1, short_id: 'aaaa1111', user_id: 7 },
        { id: 2, short_id: 'bbbb2222', user_id: 7 },
      ];
      prisma.shortUrl.findMany.mockResolvedValue(urls);

      const result = await service.urlsByUser(7, { page: 2 });

      expect(prisma.shortUrl.findMany).toHaveBeenCalledWith({
        where: { user_id: 7 },
        skip: 5,
        take: 5,
      });
      expect(result).toEqual(urls);
    });

    it('should compute offset zero for the first page', async () => {
      prisma.shortUrl.findMany.mockResolvedValue([]);

      await service.urlsByUser(7, { page: 1 });

      expect(prisma.shortUrl.findMany).toHaveBeenCalledWith({
        where: { user_id: 7 },
        skip: 0,
        take: 5,
      });
    });
  });
});
