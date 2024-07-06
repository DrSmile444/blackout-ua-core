import { Module } from '@nestjs/common';

import { OutrageParserService } from './services';

@Module({
  providers: [OutrageParserService],
  exports: [OutrageParserService],
})
export class SharedModule {}
