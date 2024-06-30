import { Controller, Get } from '@nestjs/common';

import { TelegramService } from './telegram.service';

@Controller()
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get()
  getHello(): string {
    return this.telegramService.getHello();
  }
}
