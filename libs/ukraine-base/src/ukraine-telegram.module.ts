import { Module } from '@nestjs/common';

import { UkraineCherkasyModule } from '@ukraine/ukraine-cherkasy';

import { UkraineTelegramService } from './services';

@Module({
  imports: [UkraineCherkasyModule],
  providers: [UkraineTelegramService],
  exports: [UkraineTelegramService],
})
export class UkraineTelegramModule {}
