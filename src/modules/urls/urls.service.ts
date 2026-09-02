import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { GenerateUrlDto } from 'src/modules/urls/dto/urls/generate-url-dto';
import { RedirectUrlDto } from 'src/modules/urls/dto/urls/redirect-url-dto';

@Injectable()
export class UrlsService {
  private readonly data = [
    {
      id: 1,
      shortUrl: 'ax353xbt',
      longUrl: 'http://www.youtube.com',
    },
    {
      id: 2,
      shortUrl: 'wYwfx2xf',
      longUrl: 'http://www.google.com',
    },
  ];

  async generateUrl(GenerateUrlDto: GenerateUrlDto) {
    console.log('Long URL ===============> ', GenerateUrlDto);
    const data = {
      shortCode: 'ax353xbt',
      shortUrl: 'http://localhost:3000/url/ax353xbt',
    };

    return {
        data,
        statusCode:HttpStatus.CREATED,
    };
  }

  async redirectUrl(RedirectUrlDto: RedirectUrlDto) {
    console.log('ShortCode ===================> ', RedirectUrlDto);

    const found = this.data.find((u) => u.shortUrl == RedirectUrlDto.shorturl);
    if (!found) {
      throw new NotFoundException('Not found');
    }

    return {
      statusCode: 302,
      url: found.longUrl,
    };
  }
}
