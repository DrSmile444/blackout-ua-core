import { Module } from '@nestjs/common';

import { UkraineChernivtsiParserService, UkraineChernivtsiService } from './services';

@Module({
  providers: [UkraineChernivtsiService, UkraineChernivtsiParserService],
  exports: [UkraineChernivtsiService],
})
export class UkraineChernivtsiModule {}
