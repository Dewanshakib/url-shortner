import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Redirect,
  Request,
} from '@nestjs/common';

import { UrlsService } from './urls.service.js';
import { GenerateUrlDto } from './dto/urls/generate-url-dto.js';
import { RedirectUrlDto } from './dto/urls/redirect-url-dto.js';
import { Public } from '../../common/decorator/public.decorator.js';
import { SkipResponse } from '../../common/decorator/skip-response.decorator.js';

@Controller()
export class UrlsController {
  constructor(private readonly urlService: UrlsService) {}

  @Post('urls/short-url')
  @HttpCode(201)
  async generateUrl(
    @Request() req: any,
    @Body() GenerateUrlDto: GenerateUrlDto,
  ) {
    const userId = req.user.sub;
    return this.urlService.generateUrl(userId, GenerateUrlDto);
  }

  @Public()
  @Get(':shortid')
  @Redirect()
  @SkipResponse()
  async redirectUrl(@Param() params: RedirectUrlDto) {
    // console.log('ShortCode ===================> ', params);
    return this.urlService.redirectUrl(params);
  }
}
