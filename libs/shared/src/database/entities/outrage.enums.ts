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

export enum NotificationLeadTime {
  MIN_15 = 15,
  MIN_30 = 30,
  MIN_60 = 60,
}

export type Shift = string;
