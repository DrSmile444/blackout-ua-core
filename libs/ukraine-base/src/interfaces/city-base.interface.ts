import { Outrage } from '@app/shared';

export interface CityMetadata {
  id: number;
  name: string;
  key: string;
  queues: string[];
}

export interface TelegramConfig {
  chatName: string;
  convert: (message: string) => Outrage;
}

export abstract class UkraineCityService {
  abstract getMetadata(): CityMetadata;
  abstract getTelegramConfig?(): TelegramConfig;
}