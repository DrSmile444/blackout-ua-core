export enum OutrageType {
  SCHEDULE = 'schedule',
  CHANGE = 'change',
}

export enum OutrageRegion {
  CHERKASY = 'cherkasy',
  CHERNIVTSI = 'chernivtsi',
}

export enum LightStatus {
  AVAILABLE = 0,
  UNAVAILABLE = 1,
  POSSIBLY_UNAVAILABLE = 2,
}

export class OutrageQueue {
  queue: string;

  lightStatus: LightStatus;
}

export class OutrageShift {
  start: string;

  end: string;

  queues: OutrageQueue[];
}

export class Outrage {
  type: OutrageType;

  region: OutrageRegion;

  date: Date;

  changeCount?: number;

  shifts: OutrageShift[];
}
