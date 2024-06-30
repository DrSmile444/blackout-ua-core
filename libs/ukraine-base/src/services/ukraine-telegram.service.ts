import { Injectable } from '@nestjs/common';

import { UkraineCherkasyService } from '@ukraine/ukraine-cherkasy';

@Injectable()
export class UkraineTelegramService {
  constructor(private ukraineCherkasyService: UkraineCherkasyService) {}

  getAllConfigs() {
    const regions = [this.ukraineCherkasyService];
    return regions.map((region) => ({ metadata: region.getMetadata(), telegramConfig: region.getTelegramConfig() }));
  }
}
