import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { OutrageDto } from '@app/shared';

import { UpdateService } from './update.service';

@ApiTags('update')
@Controller('update')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Throttle({
    default: {
      ttl: 10 * 60 * 1000,
      limit: 1,
    },
  })
  @Post('/')
  @ApiOperation({ summary: 'Triggers telegram to parse all messages from all regions and save in storage' })
  @ApiResponse({
    status: 200,
    type: [OutrageDto],
    description: 'Triggers telegram to parse all messages from all regions and save in storage',
  })
  update() {
    return this.updateService.triggerUpdate();
  }
}
