import { Outrage } from './outrage.entity';
import { OutrageQueue } from './outrage-queue.entity';
import { OutrageShift } from './outrage-shift.entity';
import { User } from './user.entity';
import { UserLocation } from './user-location.entity';

export * from './outrage.entity';
export * from './outrage.enums';
export * from './outrage-queue.entity';
export * from './outrage-shift.entity';
export * from './user.entity';
export * from './user-location.entity';

const userEntities = [User, UserLocation];
const outrageEntities = [Outrage, OutrageShift, OutrageQueue];

export const databaseEntities = [...userEntities, ...outrageEntities];
