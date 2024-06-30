import { Module } from '@nestjs/common';
import { OutrageController } from './controllers/outrage.controller';
import { OutrageMergerService } from './services/outrage-merger.service';
import { OutrageStorageService } from './services/outrage-storage.service';

@Module({
  controllers: [OutrageController],
  providers: [OutrageMergerService, OutrageStorageService],
})
export class OutrageModule {}
