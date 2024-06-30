import { Module } from '@nestjs/common';

import { UkraineCherkasyModule } from '@ukraine/ukraine-cherkasy';
import { UkraineChernivtsiModule } from '@ukraine/ukraine-chernivtsi';

import { UkraineBaseService } from './services';
import { UkraineScrapperModule } from './ukraine-scrapper.module';

@Module({
  imports: [UkraineCherkasyModule, UkraineChernivtsiModule, UkraineScrapperModule],
  providers: [UkraineBaseService],
  exports: [UkraineBaseService],
})
export class UkraineBaseModule {}
