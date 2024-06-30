import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OutrageDto } from '@app/shared';

import { TelegramClientService } from './services';

@ApiTags('uprate')
@Controller()
export class TelegramController {
  constructor(private readonly telegramClientService: TelegramClientService) {}

  @Post('/update')
  @ApiOperation({ summary: 'Parses all messages from all regions and save in storage' })
  @ApiResponse({
    status: 200,
    type: [OutrageDto],
    description: 'Parses all messages from all regions and save in storage',
  })
  update() {
    return this.telegramClientService.getHistory();
  }
}
