import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

import { DatabaseModule, SharedHealthModule, SharedModule } from '@app/shared';

import { UkraineTelegramModule } from '@ukraine/ukraine-base';

import { TelegramClientService } from './services';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

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
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule globally available
    }),
    DatabaseModule,
    SharedModule,
    UkraineTelegramModule,
    SharedHealthModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramClientService],
})
export class TelegramModule {}
