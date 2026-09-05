import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorator/public.decorator.js';

@Public()
@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @ApiOperation({ summary: 'Root route confirming the API is reachable' })
  @ApiOkResponse({ description: 'The API is working and reachable.' })
  async root() {
    return this.appService.root();
  }

  @Get('/health')
  @ApiOperation({ summary: 'Check the health status of the API and database' })
  @ApiOkResponse({
    description: 'Health status of the API and database connection.',
  })
  async health() {
    return this.appService.health();
  }
}
