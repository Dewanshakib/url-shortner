import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Redirect } from '@nestjs/common';
import { GenerateUrlDto } from 'src/modules/urls/dto/urls/generate-url-dto';
import { UrlsService } from './urls.service';
import { RedirectUrlDto } from 'src/modules/urls/dto/urls/redirect-url-dto';

@Controller('urls')
export class UrlsController {
    constructor(private readonly urlService:UrlsService){}

    @Post("shorturl")
    @HttpCode(201)
    async generateUrl (@Body() GenerateUrlDto:GenerateUrlDto){
        return this.urlService.generateUrl(GenerateUrlDto);
    }

    @Get(":shorturl")
    @Redirect()
    async redirectUrl (@Param() params:RedirectUrlDto){
        console.log("ShortCode ===================> ",params);
        return this.urlService.redirectUrl(params);
    }
}
