import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Redirect,
  Request,
} from '@nestjs/common';

import { UrlsService } from './urls.service.js';
import { GenerateUrlDto } from './dto/urls/generate-url-dto.js';
import { RedirectUrlDto } from './dto/urls/redirect-url-dto.js';
import { Public } from '../../common/decorator/public.decorator.js';
import { SkipResponse } from '../../common/decorator/skip-response.decorator.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('URLs')
@Controller()
export class UrlsController {
  constructor(private readonly urlService: UrlsService) {}

  @Post('urls/short-url')
  @HttpCode(201)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Generate a new short URL for the authenticated user',
  })
  @ApiBody({ type: GenerateUrlDto })
  @ApiCreatedResponse({
    description: 'Short URL has been generated successfully.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async generateUrl(
    @Request() req: any,
    @Body() GenerateUrlDto: GenerateUrlDto,
  ) {
    const userId = req.user.sub;
    // console.log("Hitting ============= ");
    // console.log("USERID ==========> ",userId);
    return this.urlService.generateUrl(userId, GenerateUrlDto);
  }

  @Public()
  @Get(':shortId')
  @Redirect()
  @SkipResponse()
  @ApiOperation({ summary: 'Redirect a short URL to the original long URL' })
  @ApiParam({
    name: 'shortId',
    description: 'The 8-character short identifier of the URL',
    example: 'aB3xK9mZ',
  })
  @ApiOkResponse({ description: 'Redirects to the original long URL.' })
  @ApiNotFoundResponse({ description: 'Invalid url.' })
  async redirectUrl(@Param() params: RedirectUrlDto) {
    // console.log('ShortCode ===================> ', params);
    return this.urlService.redirectUrl(params);
  }

  @Get('/urls/:userId')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List short URLs created by a specific user (paginated)',
  })
  @ApiParam({
    name: 'userId',
    description: 'The numeric id of the user',
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    description: 'The page number to retrieve (pagination)',
    example: 1,
    required: false,
  })
  @ApiOkResponse({
    description: 'A paginated list of short URLs belonging to the user.',
  })
  @ApiNotFoundResponse({ description: 'No short url found for this user.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async urlsByUser(@Param() param: { userId: string }, @Query() query: any) {
    // console.log("Query ===============> ",query);
    // console.log("Hitting.............");
    // console.log("UserId ==============> ",param.userId);
    return this.urlService.urlsByUser(+param.userId, query);
  }
}
