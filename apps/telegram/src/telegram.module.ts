import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UkraineTelegramModule } from '@ukraine/ukraine-base';

import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { TelegramClientService } from './services';

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
