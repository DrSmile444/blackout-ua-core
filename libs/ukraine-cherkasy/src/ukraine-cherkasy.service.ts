import { Injectable } from '@nestjs/common';

import { OutrageParserService } from '@app/shared';

import type { CityMetadata, TelegramConfig, UkraineCityService } from '@ukraine/ukraine-base';

@Injectable()
export class UkraineCherkasyService implements UkraineCityService {
  private metadata: CityMetadata = {
    id: 1,
    name: 'Черкаси',
    key: 'cherkasy',
    queues: ['1', '2', '3', '4', '5', '6'],
  };

  constructor(private outrageParserService: OutrageParserService) {}

  getMetadata(): CityMetadata {
    return this.metadata;
  }

  getTelegramConfig(): TelegramConfig {
    return {
      chatName: 'ПАТ "Черкасиобленерго"',
      // TODO add converter here
      convert: (message) => this.outrageParserService.parseMessage(message),
    };
  }
}
