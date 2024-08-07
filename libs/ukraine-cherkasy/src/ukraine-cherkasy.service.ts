import { Injectable } from '@nestjs/common';

import { OutrageParserService, OutrageRegion } from '@app/shared';

import type { CityMetadata, TelegramConfig, UkraineCityService } from '@ukraine/ukraine-base';

@Injectable()
export class UkraineCherkasyService implements UkraineCityService {
  private metadata: CityMetadata = {
    id: 1,
    name: 'Черкаси',
    key: OutrageRegion.CHERKASY,
    queues: ['1', '2', '3', '4', '5', '6'],
    findQueueUrl: 'https://www.cherkasyoblenergo.com/static/perelik-gpv',
  };

  constructor(private outrageParserService: OutrageParserService) {}

  getMetadata(): CityMetadata {
    return this.metadata;
  }

  getTelegramConfig(): TelegramConfig {
    return {
      chatName: 'ПАТ "Черкасиобленерго"',
      convert: (date, message) => this.outrageParserService.parseMessage(date, message, this.metadata.key),
    };
  }
}
