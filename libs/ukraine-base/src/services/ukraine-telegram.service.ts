import { Injectable } from '@nestjs/common';

import { UkraineCherkasyService } from '@ukraine/ukraine-cherkasy';

@Injectable()
export class UkraineTelegramService {
  constructor(private ukraineCherkasyService: UkraineCherkasyService) {}

  getAllConfigs() {
    return [this.ukraineCherkasyService.getTelegramConfig()];
  }
}
