import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';

import type { Outrage } from '@app/shared';
import { OutrageService } from '@app/shared';
import { coerceArray } from '@app/shared/utils/coerce-array.util';

import { UkraineScrapperService } from '@ukraine/ukraine-base';

@Injectable()
export class ScrapperService {
  constructor(
    private readonly httpService: HttpService,
    private outrageService: OutrageService,
    private ukraineScrapperService: UkraineScrapperService,
  ) {
    this.scrapeOutrages().catch(console.error);
  }

  async scrapeOutrages() {
    let updatedOutrages: Outrage[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const config of this.ukraineScrapperService.getAllConfigs()) {
      const { scrapperConfig } = config;

      // eslint-disable-next-line no-await-in-loop
      const response = await firstValueFrom(this.httpService.get<string>(scrapperConfig.url));
      const cheerioAPI = cheerio.load(response.data);

      const result = scrapperConfig.parser(cheerioAPI);

      // eslint-disable-next-line no-await-in-loop
      const newUpdatedOutrages = await this.outrageService.bulkSaveOutrages(coerceArray(result));

      updatedOutrages = [...updatedOutrages, ...newUpdatedOutrages];
    }

    console.info('updatedOutrages', updatedOutrages);

    return updatedOutrages;
  }
}
