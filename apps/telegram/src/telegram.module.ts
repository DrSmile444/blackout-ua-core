import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { TelegramClientService } from './services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule globally available
    }),
  ],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramClientService],
})
export class TelegramModule {}
