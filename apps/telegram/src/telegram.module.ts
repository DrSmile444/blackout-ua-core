import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

import { DatabaseModule, SharedHealthModule, SharedModule } from '@app/shared';

import { UkraineTelegramModule } from '@ukraine/ukraine-base';

import { TelegramClientService } from './services';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
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
