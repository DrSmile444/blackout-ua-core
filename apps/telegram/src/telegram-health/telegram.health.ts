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

      if (isHealthy) {
        return this.getStatus(key, isHealthy, { result });
      }

      throw new HealthCheckError('TelegramHealthIndicator failed', { result });
    } catch {
      throw new HealthCheckError('TelegramHealthIndicator failed', this.getStatus(key, false));
    }
  }
}
