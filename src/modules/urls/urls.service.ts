import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GenerateUrlDto } from './dto/urls/generate-url-dto.js';
import { RedirectUrlDto } from './dto/urls/redirect-url-dto.js';
import { ConfigService } from '@nestjs/config';
import ShortUniqueId from 'short-unique-id';
import { PrismaService } from '../../database/prisma.service.js';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UrlsService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async generateUrl(userId: number, GenerateUrlDto: GenerateUrlDto) {
    const { randomUUID } = new ShortUniqueId({ length: 8 });

    const shortId = randomUUID();

    const newShortUrl = await this.prisma.shortUrl.create({
      data: {
        short_id: shortId,
        redirect_url: GenerateUrlDto.url,
        user_id: userId,
      },
    });

    const convertedUrl =
      this.config.get<string>('BASE_URL') + newShortUrl.short_id;

    const data = { ...newShortUrl, shortUrl: convertedUrl };

    return data;
  }

  async redirectUrl(RedirectUrlDto: RedirectUrlDto) {
    const cacheKey = `url:${RedirectUrlDto.shortId}`;

    const cached = await this.cache.get<{
      statusCode: number;
      url: string;
    }>(cacheKey);



    if (cached) {
      await this.prisma.shortUrl.update({
        where: { short_id: RedirectUrlDto.shortId },
        data: {
          click_count: {
            increment: 1,
          },
        },
      });

      return cached;
    }

    // Cache Misss
    // console.log('DB HITTING !!!!!!!!!!!!!!!!');

    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: {
        short_id: RedirectUrlDto.shortId,
      },
    });

    if (!shortUrl) {
      throw new NotFoundException('Invalid url');
    }


    await this.prisma.shortUrl.update({
      where: { id: shortUrl.id },
      data: {
        click_count: {
          increment: 1,
        },
      },
    });

  
    const response = {
      statusCode: 302,
      url: shortUrl.redirect_url,
    };

    await this.cache.set(cacheKey, response);


    return response;
  }

  async urlsByUser(userId: number, query: { page: number }) {
    const page = Number(query.page);
    const limit = 5;
    const offset = (page - 1) * limit;

    const cacheKey = `uid:${userId}`;
    const cached = await this.cache.get<
      Array<{
        id: number;
        short_id: string;
        redirect_url: string;
        click_count: number;
        user_id: number;
      }>
    >(cacheKey);

    if (cached) {
      return cached;
    }

    // Cache Misss
    // console.log('DB HITINGGGGGG !!!!!!!!!!!!');

    const urlsByUser = await this.prisma.shortUrl.findMany({
      where: { user_id: userId },
      skip: offset,
      take: limit,
    });

    if (!urlsByUser) {
      throw new NotFoundException('No short url found for this user');
    }
    await this.cache.set(`uid:${userId}`, urlsByUser);

    return urlsByUser;
  }
}
