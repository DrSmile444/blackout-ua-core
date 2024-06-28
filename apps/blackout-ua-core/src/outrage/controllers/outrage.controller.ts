import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';

import { OutrageParserService } from '../services/outrage-parser.service';
import { OutrageStorageService } from '../services/outrage-storage.service';
import { OutrageMergerService } from '../services/outrage-merger.service';
import { OutrageDto, OutrageMessageDto } from '../dto/outrage.dto';
import { Outrage } from '../entities/outrage.entity';

@ApiTags('outrage')
@Controller('outrage')
export class OutrageController {
  constructor(
    private readonly outrageParserService: OutrageParserService,
    private readonly outrageStorageService: OutrageStorageService,
    private readonly outrageMergerService: OutrageMergerService,
  ) {}

  @Post('/process')
  @ApiBody({ type: OutrageMessageDto })
  @ApiResponse({ status: 200, type: OutrageDto })
  process(@Body() body: { message: string }): Outrage {
    return this.outrageParserService.parseMessage(body.message);
  }

  @Post('/')
  @ApiBody({ type: OutrageMessageDto })
  @ApiResponse({ status: 200, type: OutrageDto })
  saveOutrage(@Body() body: { message: string }): Outrage {
    const parsedMessage = this.outrageParserService.parseMessage(body.message);
    return this.outrageStorageService.saveOutrage(parsedMessage);
  }

  @Get('/')
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'queues', required: false })
  @ApiQuery({ name: 'final', required: false })
  @ApiResponse({ status: 200, type: [OutrageDto] })
  getOutrages(
    @Query('date') date?: string,
    @Query('queues') queues?: string,
    @Query('final') final?: boolean,
  ): Outrage | Outrage[] {
    const parsedDate = date ? new Date(date) : new Date();
    const outrages = queues
      ? this.outrageStorageService.getOutragesByQueue(
          parsedDate,
          queues.split(',').map(Number),
        )
      : this.outrageStorageService.getOutrages(parsedDate);

    if (final) {
      return this.outrageMergerService.mergeOutrages(outrages);
    }

    return outrages;
  }

  @Get('/storage')
  getRawStorage() {
    return this.outrageStorageService.getRawStorage();
  }
}
