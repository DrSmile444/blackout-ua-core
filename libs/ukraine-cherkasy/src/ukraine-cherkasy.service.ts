import { Injectable } from '@nestjs/common';
import { CityMetadata, UkraineCityService } from '@ukraine/ukraine-base';

@Injectable()
export class UkraineCherkasyService implements UkraineCityService {
  private metadata: CityMetadata = {
    id: 1,
    name: 'Cherkasy',
    queues: ['1', '2', '3', '4', '5', '6'],
  };

  getMetadata(): CityMetadata {
    return this.metadata;
  }
}
