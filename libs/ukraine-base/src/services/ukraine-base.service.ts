import { Injectable } from '@nestjs/common';

import type { CityMetadata } from '@ukraine/ukraine-base';
import { UkraineCherkasyService } from '@ukraine/ukraine-cherkasy';
import { UkraineChernivtsiService } from '@ukraine/ukraine-chernivtsi';

@Injectable()
export class UkraineBaseService {
  constructor(
    private ukraineCherkasyService: UkraineCherkasyService,
    private ukraineChernivtsiService: UkraineChernivtsiService,
  ) {}

  getAllMetadata(): CityMetadata[] {
    const regions = [this.ukraineCherkasyService, this.ukraineChernivtsiService];
    return regions.map((region) => region.getMetadata());
  }
}
