import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UkraineTelegramModule } from '@ukraine/ukraine-base';

import { TelegramClientService } from './services';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule globally available
    }),
    UkraineTelegramModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramClientService],
})
export class TelegramModule {}
