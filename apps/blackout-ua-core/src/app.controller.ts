import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ description: 'Hello World!' })
  getHello(): string {
    return this.appService.getHello();
  }

  // Create an endpoint that returns the current time on server and timezone
  @Get('time')
  @ApiOkResponse({ description: 'Current time on server and timezone' })
  getTime() {
    return {
      time: new Date().toString(),
      timeIso: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}
