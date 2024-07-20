import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { RedisModule } from '@nestjs-modules/ioredis';

import { DatabaseModule, SharedModule } from '@app/shared';

import { UkraineTelegramModule } from '@ukraine/ukraine-base';

import { TelegramHealthIndicator } from './telegram-health/telegram.health';
import { TelegramHealthController } from './telegram-health/telegram-health.controller';
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
    TerminusModule,
  ],
  controllers: [TelegramController, TelegramHealthController],
  providers: [TelegramService, TelegramClientService, TelegramHealthIndicator],
})
export class TelegramModule {}
