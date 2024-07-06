import { Module } from '@nestjs/common';

import { DatabaseModule, SharedModule } from '@app/shared';

import { OutrageMergerService } from '../outrage/services';

import { PushNotificationService } from './services';

@Module({
  imports: [DatabaseModule, SharedModule],
  providers: [PushNotificationService, OutrageMergerService],
})
export class PushNotificationModule {}
