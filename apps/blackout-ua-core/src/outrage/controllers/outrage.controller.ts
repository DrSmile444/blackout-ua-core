import { CacheInterceptor } from '@nestjs/cache-manager';
import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { Outrage } from '@app/shared';
import { OutrageDto, OutrageMessageDto, OutrageParserService, OutrageResponseDto, OutrageService } from '@app/shared';

import { UpdateService } from '../../update/update.service';
import { SearchOutragesDto } from '../dto';
import { OutrageMergerService } from '../services';

@ApiTags('outrage')
@Controller('outrage')
@UseInterceptors(CacheInterceptor)
export class OutrageController {
  constructor(
    private readonly outrageParserService: OutrageParserService,
    private readonly outrageMergerService: OutrageMergerService,
    private readonly outrageService: OutrageService,
    private readonly updateService: UpdateService,
  ) {}

  @Post('/')
  @ApiBody({ type: OutrageMessageDto })
  @ApiOperation({ summary: 'Parse a message and create a new outrage', deprecated: true })
  @ApiResponse({
    status: 200,
    type: OutrageDto,
    description: 'Create a new outrage from a message',
  })
  async create(@Body() body: OutrageMessageDto) {
    const outrageDto = this.outrageParserService.parseMessage(body.message, body.region);
    return await this.outrageService.saveOutrage(outrageDto);
  }

  @Post('/search')
  @ApiBody({ type: SearchOutragesDto })
  @ApiOperation({ summary: 'Returns a list of outrages' })
  @ApiResponse({
    status: 200,
    type: OutrageResponseDto,
    description: 'Returns a list of outrages',
  })
  async searchOutrages(@Body() searchOutragesDto: SearchOutragesDto): Promise<OutrageResponseDto> {
    const { regions, date, final } = searchOutragesDto;
    const clearDate = date || new Date();
    const accessDate = new Date(clearDate.setHours(0, 0, 0, 0));

    const outrages: Outrage[] = [];
    for (const { region, queues } of regions) {
      if (queues.length > 0) {
        outrages.push(...(await this.outrageService.findOutrages(accessDate, region, queues)));
      } else {
        outrages.push(...(await this.outrageService.findOutragesByDateAndRegion(accessDate, region)));
      }
    }

    if (final) {
      return {
        lastUpdate: this.updateService.getLastUpdateTime(),
        accessDate,
        outrages: outrages.length > 0 ? this.outrageMergerService.mergeOutragesByRegion(outrages) : [],
      };
    }

    return { lastUpdate: this.updateService.getLastUpdateTime(), accessDate, outrages };
  }

  // TODO remove this endpoint
  @Post('/test')
  @ApiBody({ type: OutrageMessageDto })
  @ApiResponse({ status: 200, type: OutrageDto })
  @ApiOperation({ summary: 'Test how parsing logic works', deprecated: true })
  process(@Body() body: OutrageMessageDto): OutrageDto {
    return this.outrageParserService.parseMessage(body.message, body.region);
  }

  @Get('/all')
  @ApiOperation({ summary: 'Returns the complete storage for debug', deprecated: true })
  getRawStorage() {
    return this.outrageService.getAll();
  }
}
