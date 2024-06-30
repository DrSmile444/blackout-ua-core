import { Module } from '@nestjs/common';

import { UkraineChernivtsiModule } from '@ukraine/ukraine-chernivtsi';

import { UkraineScrapperService } from './services';

@Module({
  imports: [UkraineChernivtsiModule],
  providers: [UkraineScrapperService],
  exports: [UkraineScrapperService],
})
export class UkraineScrapperModule {}
