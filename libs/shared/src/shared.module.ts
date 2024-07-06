import { Module } from '@nestjs/common';

import { OutrageParserService, OutrageStorageService } from './services';

@Module({
  providers: [OutrageParserService, OutrageStorageService],
  exports: [OutrageParserService, OutrageStorageService],
})
export class SharedModule {}
