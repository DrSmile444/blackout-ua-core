import { Injectable } from '@nestjs/common';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { Api } from 'telegram';

import { TelegramClientService } from '../services';

@Injectable()
export class TelegramHealthIndicator extends HealthIndicator {
  constructor(private readonly telegramClient: TelegramClientService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.telegramClient.client.invoke(new Api.help.GetNearestDc());
      const isHealthy = !!(result && result.nearestDc);

      return this.getStatus(key, isHealthy, { result });
    } catch (error) {
      return this.getStatus(key, false, {});
      throw new HealthCheckError('TelegramHealthIndicator failed', error);
    }
  }
}
