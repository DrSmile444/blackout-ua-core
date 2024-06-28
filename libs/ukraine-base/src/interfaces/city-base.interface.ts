export interface CityMetadata {
  id: number;
  name: string;
  queues: string[];
}

export abstract class UkraineCityService {
  abstract getMetadata(): CityMetadata;
}
