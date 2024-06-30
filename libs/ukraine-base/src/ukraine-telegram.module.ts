import { Module } from '@nestjs/common';

import { UkraineTelegramService } from '@ukraine/ukraine-base';
import { UkraineCherkasyModule } from '@ukraine/ukraine-cherkasy';

@Module({
  imports: [UkraineCherkasyModule],
  providers: [UkraineTelegramService],
  exports: [UkraineTelegramService],
})
export class UkraineTelegramModule {}
