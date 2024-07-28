import { Injectable } from '@nestjs/common';

import { OutrageRegion } from '@app/shared';

import type { CityMetadata, ScrapperConfig, UkraineCityService } from '@ukraine/ukraine-base';

import { UkraineChernivtsiParserService } from './ukraine-chernivtsi-parser.service';

@Injectable()
export class UkraineChernivtsiService implements UkraineCityService {
  private metadata: CityMetadata = {
    id: 2,
    name: 'Чернівці',
    key: OutrageRegion.CHERNIVTSI,
    queues: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
    findQueueUrl: 'https://oblenergo.cv.ua/shutdowns-search/',
  };

  constructor(private ukraineChernivtsiParserService: UkraineChernivtsiParserService) {}

  getMetadata(): CityMetadata {
    return this.metadata;
  }

  getScrapperConfig(): ScrapperConfig {
    return {
      url: 'https://oblenergo.cv.ua/shutdowns/',
      parser: ($) => this.ukraineChernivtsiParserService.parseMessageCheerio($),
    };
  }
}
