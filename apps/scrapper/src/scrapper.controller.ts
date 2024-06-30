import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OutrageDto } from '@app/shared';

import { ScrapperService } from './scrapper.service';

@ApiTags('update')
@Controller()
export class ScrapperController {
  constructor(private readonly scrapperService: ScrapperService) {}

  @Post('/update')
  @ApiOperation({ summary: 'Parses all messages from all regions and save in storage' })
  @ApiResponse({
    status: 200,
    type: [OutrageDto],
    description: 'Parses all messages from all regions and save in storage',
  })
  update() {
    return this.scrapperService.scrapeOutrages();
  }
}
