import { CacheInterceptor } from '@nestjs/cache-manager';
import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OutrageDto, OutrageMessageDto, OutrageParserService, OutrageRegion, OutrageResponseDto, OutrageService } from '@app/shared';

import { UpdateService } from '../../update/update.service';
import { ParseBoolPipe, ParseDatePipe, ParseStringArrayPipe, RequiredQueryParamPipe, ValidRegionPipe } from '../pipes';
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

  @Get('/')
  @ApiQuery({
    name: 'region',
    enum: OutrageRegion,
    description: 'Region key to filter outrages by',
    required: true,
  })
  @ApiQuery({
    name: 'date',
    example: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    required: false,
  })
  @ApiQuery({
    name: 'queues',
    example: ['4'],
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
    @Query('queues', ParseStringArrayPipe) queues?: string[],
    @Query('final', ParseBoolPipe) final?: boolean,
  ): Promise<OutrageResponseDto> {
    const clearDate = date || new Date();
    const accessDate = new Date(clearDate.setHours(0, 0, 0, 0));
    const outrages =
      queues.length > 0
        ? await this.outrageService.findOutrages(accessDate, region, queues)
        : await this.outrageService.findOutragesByDateAndRegion(accessDate, region);

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
