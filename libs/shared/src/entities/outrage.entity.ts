export enum OutrageType {
  SCHEDULE = 'schedule',
  CHANGE = 'change',
}

export class OutrageShift {
  start: string;
  end: string;
  queues: number[];
}

export class Outrage {
  type: OutrageType;
  date: Date;
  changeCount?: number;
  shifts: OutrageShift[];
}
