import { Injectable, NotFoundException } from '@nestjs/common';
import { GenerateUrlDto } from './dto/urls/generate-url-dto.js';
import { RedirectUrlDto } from './dto/urls/redirect-url-dto.js';
import { ConfigService } from '@nestjs/config';
import ShortUniqueId from 'short-unique-id';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class UrlsService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async generateUrl(userId: number, GenerateUrlDto: GenerateUrlDto) {
    const { randomUUID } = new ShortUniqueId({ length: 8 });
    // console.log('Long URL ===============> ', GenerateUrlDto);
    const shortId = randomUUID();
    // console.log("ShortId ==========================> ",shortId);
    // console.log("Converted Url ==========================> ",convertedUrl);

    const newShortUrl = await this.prisma.shortUrl.create({
      data: {
        short_id: shortId,
        redirect_url: GenerateUrlDto.url,
        user_id: userId,
      },
    });
    // console.log("NEW SHOR URL ================> ",newShortUrl);
    const convertedUrl =
      this.config.get<string>('BASE_URL') + newShortUrl.short_id;
    const data = { ...newShortUrl, shortUrl: convertedUrl };

    return data;
  }

  async redirectUrl(RedirectUrlDto: RedirectUrlDto) {
    // console.log('ShortCode ===================> ', RedirectUrlDto);
    // console.log('ShortId ==============> ', RedirectUrlDto.shortid);
    const shortUrl = await this.prisma.shortUrl.findFirst({
      where: { short_id: RedirectUrlDto.shortId },
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

    return {
      statusCode: 302,
      url: shortUrl.redirect_url,
    };
  }

  async urlsByUser(userId: number, query: { page: number }) {
    // console.log('Query =============> ', query);
    const page = Number(query.page);
    const limit = 5;
    const offset = (page - 1) * limit;

    // console.log("Page ==============>", page);
    // console.log("Offset ==============>", offset);

    const urlsByUser = await this.prisma.shortUrl.findMany({
      where: { user_id: userId },
      skip: offset,
      take: limit,
    });

    if (!urlsByUser) {
      throw new NotFoundException('No short url found for this user');
    }

    return urlsByUser;
  }
}
