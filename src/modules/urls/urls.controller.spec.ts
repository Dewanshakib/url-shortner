import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from './urls.controller.js';
import { UrlsService } from './urls.service.js';

describe('UrlsController', () => {
  let controller: UrlsController;
  let urlsService: {
    generateUrl: jest.Mock<(userId: number, dto: any) => Promise<any>>;
    redirectUrl: jest.Mock<(params: any) => Promise<any>>;
    urlsByUser: jest.Mock<(userId: number, query: any) => Promise<any>>;
  };

  beforeEach(async () => {
    urlsService = {
      generateUrl: jest.fn(),
      redirectUrl: jest.fn(),
      urlsByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [{ provide: UrlsService, useValue: urlsService }],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
  });

  describe('generateUrl', () => {
    it('should delegate to urlsService.generateUrl with the authenticated user id', async () => {
      const req = { user: { sub: 5 } };
      const dto = { url: 'https://example.com' };
      const created = {
        id: 1,
        short_id: 'abcd1234',
        redirect_url: dto.url,
        shortUrl: 'http://localhost:5000/abcd1234',
      };
      urlsService.generateUrl.mockResolvedValue(created);

      await expect(controller.generateUrl(req, dto)).resolves.toEqual(created);
      expect(urlsService.generateUrl).toHaveBeenCalledWith(5, dto);
    });
  });

  describe('redirectUrl', () => {
    it('should delegate to urlsService.redirectUrl with the short id param', async () => {
      const params = { shortId: 'abcd1234' };
      const redirect = { statusCode: 302, url: 'https://example.com' };
      urlsService.redirectUrl.mockResolvedValue(redirect);

      await expect(controller.redirectUrl(params)).resolves.toEqual(redirect);
      expect(urlsService.redirectUrl).toHaveBeenCalledWith(params);
    });
  });

  describe('urlsByUser', () => {
    it('should delegate to urlsService.urlsByUser with numeric user id and query', async () => {
      const urls = [{ id: 1, short_id: 'abcd1234' }];
      urlsService.urlsByUser.mockResolvedValue(urls);

      await expect(
        controller.urlsByUser({ userId: '7' }, { page: 1 }),
      ).resolves.toEqual(urls);
      expect(urlsService.urlsByUser).toHaveBeenCalledWith(7, { page: 1 });
    });
  });
});
