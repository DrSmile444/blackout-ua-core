import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import type { Outrage } from '@app/shared';

@Injectable()
export class UpdateService {
  private readonly telegramUpdateUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.telegramUpdateUrl = `${this.configService.get<string>('TELEGRAM_API_URL')}/update`;
  }

  async triggerUpdate(): Promise<Outrage[]> {
    const response = await firstValueFrom(this.httpService.post<Outrage[]>(this.telegramUpdateUrl));
    return response.data;
  }
}
