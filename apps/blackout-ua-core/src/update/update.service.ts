import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

import type { Outrage } from '@app/shared';

@Injectable()
export class UpdateService {
  private readonly telegramUpdateUrl: string;

  private readonly scrapperUpdateUrl: string;

  private lastUpdateTime: Date | null = null;

  private readonly logger = new Logger(UpdateService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.telegramUpdateUrl = `${this.configService.get<string>('TELEGRAM_API_URL')}/update`;
    this.scrapperUpdateUrl = `${this.configService.get<string>('SCRAPPER_API_URL')}/update`;
  }

  async triggerUpdate(): Promise<Outrage[]> {
    const telegramResponse = await firstValueFrom(this.httpService.post<Outrage[]>(this.telegramUpdateUrl));
    const scrapperResponse = await firstValueFrom(this.httpService.post<Outrage[]>(this.scrapperUpdateUrl));

    const response = [...telegramResponse.data, ...scrapperResponse.data];
    this.lastUpdateTime = new Date();
    return response;
  }

  getLastUpdateTime(): Date | null {
    return this.lastUpdateTime;
  }

  @Cron('0 */10 * * * *') // Every 10 minutes
  private async autoUpdate() {
    this.logger.debug('Called every 10 minutes to trigger update');
    try {
      await this.triggerUpdate().then((outrages) => {
        this.logger.log(`Successfully updated ${outrages.length} outrages`);
      });
      this.logger.debug('Update triggered successfully');
    } catch (error) {
      this.logger.error('Error triggering update', error);
    }
  }
}
