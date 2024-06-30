import { Injectable } from '@nestjs/common';

import { UkraineChernivtsiService } from '@ukraine/ukraine-chernivtsi';

@Injectable()
export class UkraineScrapperService {
  constructor(private ukraineChernivtsi: UkraineChernivtsiService) {}

  getAllConfigs() {
    const regions = [this.ukraineChernivtsi];
    return regions.map((region) => ({ metadata: region.getMetadata(), scrapperConfig: region.getScrapperConfig() }));
  }
}
