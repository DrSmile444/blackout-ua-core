import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/shared';

import { PushNotificationService } from './services';

@Module({
  imports: [DatabaseModule],
  providers: [PushNotificationService],
})
export class PushNotificationModule {}
