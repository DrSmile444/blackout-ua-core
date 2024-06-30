export enum OutrageType {
  SCHEDULE = 'schedule',
  CHANGE = 'change',
}

export enum OutrageRegion {
  CHERKASY = 'cherkasy',
}

export class OutrageShift {
  start: string;

  end: string;

  queues: number[];
}

export class Outrage {
  type: OutrageType;

  region: OutrageRegion;

  date: Date;

  changeCount?: number;

  shifts: OutrageShift[];
}
