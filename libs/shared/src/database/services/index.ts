import { OutrageService } from './outrage.service';
import { UserService } from './user.service';

export * from './outrage.service';
export * from './user.service';

export const databaseServices = [UserService, OutrageService];
