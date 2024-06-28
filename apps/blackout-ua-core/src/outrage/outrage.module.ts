import { Module } from '@nestjs/common';
import { OutrageController } from './controllers/outrage.controller';
import { OutrageParserService } from './services/outrage-parser.service';
import { OutrageMergerService } from './services/outrage-merger.service';
import { OutrageStorageService } from './services/outrage-storage.service';

@Module({
  controllers: [OutrageController],
  providers: [
    OutrageParserService,
    OutrageMergerService,
    OutrageStorageService,
  ],
})
export class OutrageModule {}
