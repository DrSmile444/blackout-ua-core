import type { CheerioAPI } from 'cheerio/lib/load';

import type { OutrageDto, OutrageRegion } from '@app/shared';

export interface CityMetadata {
  id: number;
  name: string;
  key: OutrageRegion;
  queues: string[];
  findQueueUrl: string;
}

export interface TelegramConfig {
  chatName: string;
  convert: (message: string) => OutrageDto;
}

export interface ScrapperConfig {
  url: string;
  parser: (pageApi: CheerioAPI) => OutrageDto;
}

export abstract class UkraineCityService {
  abstract getMetadata(): CityMetadata;

  abstract getTelegramConfig?(): TelegramConfig;

  abstract getScrapperConfig?(): ScrapperConfig;
}
