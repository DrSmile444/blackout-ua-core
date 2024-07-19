import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

import { CityModule } from './city/city.module';
import { OutrageModule } from './outrage/outrage.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { UpdateModule } from './update/update.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    OutrageModule,
    CityModule,
    UpdateModule,
    UserModule,
    PushNotificationModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
