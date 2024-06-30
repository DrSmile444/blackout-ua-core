import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiQuery,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { OutrageParserService } from '@app/shared';
import { OutrageStorageService } from '../services/outrage-storage.service';
import { OutrageMergerService } from '../services/outrage-merger.service';
import { OutrageDto, OutrageMessageDto } from '../dto/outrage.dto';
import { Outrage } from '@app/shared';
import { ParseNumberArrayPipe } from '../pipes/parse-number-array.pipe';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { ParseBoolPipe } from '../pipes/parse-bool.pipe';

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
  saveOutrage(@Body() body: OutrageMessageDto): Outrage {
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
  getOutrages(
    @Query('date', ParseDatePipe) date?: Date,
    @Query('queues', ParseNumberArrayPipe) queues?: number[],
    @Query('final', ParseBoolPipe) final?: boolean,
  ): Outrage | Outrage[] {
    const parsedDate = date || new Date();
    const outrages = queues.length
      ? this.outrageStorageService.getOutragesByQueue(parsedDate, queues)
      : this.outrageStorageService.getOutrages(parsedDate);

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