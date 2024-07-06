import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { CityModule } from './city/city.module';
import { OutrageModule } from './outrage/outrage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UpdateModule } from './update/update.module';
import { UserModule } from './user/user.module';
import { PushNotificationModule } from './push-notification/push-notification.module';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    OutrageModule,
    CityModule,
    UpdateModule,
    UserModule,
    PushNotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
