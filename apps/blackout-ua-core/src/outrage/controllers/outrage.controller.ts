import { CacheInterceptor } from '@nestjs/cache-manager';
import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { Outrage } from '@app/shared';
import { OutrageParserService, OutrageSearchResponseDto, OutrageService } from '@app/shared';

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

  @Post('/search')
  @ApiBody({ type: SearchOutragesDto })
  @ApiOperation({ summary: 'Returns a list of outrages' })
  @ApiResponse({
    status: 200,
    type: OutrageSearchResponseDto,
    description: 'Returns a list of outrages',
  })
  async searchOutrages(@Body() searchOutragesDto: SearchOutragesDto): Promise<OutrageSearchResponseDto> {
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
      const result = new OutrageSearchResponseDto();
      result.lastUpdate = this.updateService.getLastUpdateTime();
      result.accessDate = accessDate;
      result.outrages =
        outrages.length > 0
          ? this.outrageMergerService.mergeOutragesByRegion(outrages).map((outrage) => this.outrageService.convertToResponse(outrage))
          : [];

      return result;
    }

    return {
      lastUpdate: this.updateService.getLastUpdateTime(),
      accessDate,
      outrages: outrages.map((outrage) => this.outrageService.convertToResponse(outrage)),
    };
  }

  @Get('/all')
  @ApiOperation({ summary: 'Returns the complete storage for debug', deprecated: true })
  getRawStorage() {
    return this.outrageService.getAll();
  }
}
