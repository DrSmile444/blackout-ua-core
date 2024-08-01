import { useEnum } from '../../utils/use-enum.helper';

// Enums
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

// API options
export const outrageTypeApiOptions = useEnum()({
  enum: OutrageType,
  enumName: 'OutrageType',
  example: OutrageType.SCHEDULE,
});

export const outrageRegionApiOptions = useEnum()({
  enum: OutrageRegion,
  enumName: 'OutrageRegion',
  example: OutrageRegion.CHERKASY,
});

export const lightStatusApiOptions = useEnum()({
  enum: LightStatus,
  enumName: 'LightStatus',
  example: LightStatus.AVAILABLE,
});

export const notificationLeadTimeApiOptions = useEnum()({
  enum: NotificationLeadTime,
  enumName: 'NotificationLeadTime',
  example: NotificationLeadTime.MIN_15,
});

export type Shift = Date;
