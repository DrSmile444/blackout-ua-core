import { Injectable } from '@nestjs/common';

import { CityMetadata } from '@ukraine/ukraine-base';
import { UkraineCherkasyService } from '@ukraine/ukraine-cherkasy';

@Injectable()
export class UkraineBaseService {
  constructor(private ukraineCherkasyService: UkraineCherkasyService) {}

  getAllMetadata(): CityMetadata[] {
    return [this.ukraineCherkasyService.getMetadata()];
  }
}
