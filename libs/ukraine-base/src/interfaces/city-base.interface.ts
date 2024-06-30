import type { CheerioAPI } from 'cheerio/lib/load';

import type { Outrage, OutrageRegion } from '@app/shared';

export interface CityMetadata {
  id: number;
  name: string;
  key: OutrageRegion;
  queues: string[];
}

export interface TelegramConfig {
  chatName: string;
  convert: (message: string) => Outrage;
}

export interface ScrapperConfig {
  url: string;
  parser: (pageApi: CheerioAPI) => Outrage;
}

export abstract class UkraineCityService {
  abstract getMetadata(): CityMetadata;

  abstract getTelegramConfig?(): TelegramConfig;

  abstract getScrapperConfig?(): ScrapperConfig;
}
