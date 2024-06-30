import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Outrage, OutrageParserService } from '@app/shared';

import { OutrageDto, OutrageMessageDto } from '../dto/outrage.dto';
import { ParseBoolPipe } from '../pipes/parse-bool.pipe';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { ParseNumberArrayPipe } from '../pipes/parse-number-array.pipe';
import { OutrageMergerService } from '../services/outrage-merger.service';
import { OutrageStorageService } from '../services/outrage-storage.service';

@ApiTags('outrage')
@Controller('outrage')
export class OutrageController {
  constructor(
    private readonly outrageParserService: OutrageParserService,
    private readonly outrageStorageService: OutrageStorageService,
    private readonly outrageMergerService: OutrageMergerService,
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
    const parsedMessage = this.outrageParserService.parseMessage(body.message);
    return this.outrageStorageService.saveOutrage(parsedMessage);
  }

  @Get('/')
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
    type: [OutrageDto],
    description: 'Returns a list of outrages',
  })
  @ApiOperation({ summary: 'Returns a list of outrages' })
  async getOutrages(
    @Query('date', ParseDatePipe) date?: Date,
    @Query('queues', ParseNumberArrayPipe) queues?: number[],
    @Query('final', ParseBoolPipe) final?: boolean,
  ): Promise<Outrage | Outrage[]> {
    const parsedDate = date || new Date();
    const outrages =
      queues.length > 0
        ? await this.outrageStorageService.getOutragesByQueue(parsedDate, queues)
        : await this.outrageStorageService.getOutrages(parsedDate);

    if (final) {
      return this.outrageMergerService.mergeOutrages(outrages);
    }

    return outrages;
  }

  @Post('/test')
  @ApiBody({ type: OutrageMessageDto })
  @ApiResponse({ status: 200, type: OutrageDto })
  @ApiOperation({ summary: 'Test how parsing logic works' })
  process(@Body() body: OutrageMessageDto): Outrage {
    return this.outrageParserService.parseMessage(body.message);
  }

  @Get('/storage')
  @ApiOperation({ summary: 'Returns the complete storage for debug' })
  getRawStorage() {
    return this.outrageStorageService.getRawStorage();
  }
}
