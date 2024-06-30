import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  Outrage,
  OutrageDto,
  OutrageMessageDto,
  OutrageParserService,
  OutrageRegion,
  OutrageResponseDto,
  OutrageStorageService,
} from '@app/shared';

import { UpdateService } from '../../update/update.service';
import { ParseBoolPipe, ParseDatePipe, ParseNumberArrayPipe, RequiredQueryParamPipe, ValidRegionPipe } from '../pipes';
import { OutrageMergerService } from '../services';

@ApiTags('outrage')
@Controller('outrage')
export class OutrageController {
  constructor(
    private readonly outrageParserService: OutrageParserService,
    private readonly outrageStorageService: OutrageStorageService,
    private readonly outrageMergerService: OutrageMergerService,
    private readonly updateService: UpdateService,
  ) {}

  @Post('/')
  @ApiBody({ type: OutrageMessageDto })
  @ApiOperation({ summary: 'Parse a message and create a new outrage' })
  @ApiResponse({
    status: 200,
    type: OutrageDto,
    description: 'Create a new outrage from a message',
  })
  saveOutrage(@Body() body: OutrageMessageDto): Promise<Outrage> {
    const parsedMessage = this.outrageParserService.parseMessage(body.message, body.region);
    return this.outrageStorageService.saveOutrage(parsedMessage);
  }

  @Get('/')
  @ApiQuery({
    name: 'region',
    enum: OutrageRegion,
    description: 'Region key to filter outrages by',
    required: true,
  })
  @ApiQuery({
    name: 'date',
    example: '2024-06-25',
    required: false,
  })
  @ApiQuery({
    name: 'queues',
    example: '1,2,4',
    required: false,
  })
  @ApiQuery({
    name: 'final',
    description: 'Return a merged final schedule for a selected day if true',
    type: Boolean,
    example: true,
    required: false,
  })
  @ApiResponse({
    status: 200,
    type: OutrageResponseDto,
    description: 'Returns a list of outrages',
  })
  @ApiOperation({ summary: 'Returns a list of outrages' })
  async getOutrages(
    @Query('region', RequiredQueryParamPipe, ValidRegionPipe) region: OutrageRegion,
    @Query('date', ParseDatePipe) date?: Date,
    @Query('queues', ParseNumberArrayPipe) queues?: number[],
    @Query('final', ParseBoolPipe) final?: boolean,
  ): Promise<OutrageResponseDto> {
    const accessDate = date || new Date();
    const outrages =
      queues.length > 0
        ? await this.outrageStorageService.getOutragesByQueue(accessDate, region, queues)
        : await this.outrageStorageService.getOutrages(accessDate, region);

    if (final) {
      return {
        lastUpdate: this.updateService.getLastUpdateTime(),
        accessDate,
        outrages: outrages.length > 0 ? [this.outrageMergerService.mergeOutrages(outrages)] : [],
      };
    }

    return { lastUpdate: this.updateService.getLastUpdateTime(), accessDate, outrages };
  }

  // TODO remove this endpoint
  @Post('/test')
  @ApiBody({ type: OutrageMessageDto })
  @ApiResponse({ status: 200, type: OutrageDto })
  @ApiOperation({ summary: 'Test how parsing logic works' })
  process(@Body() body: OutrageMessageDto): Outrage {
    return this.outrageParserService.parseMessage(body.message, body.region);
  }

  @Get('/storage')
  @ApiOperation({ summary: 'Returns the complete storage for debug' })
  getRawStorage() {
    return this.outrageStorageService.getRawStorage();
  }
}
