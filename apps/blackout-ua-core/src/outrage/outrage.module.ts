import { Module } from '@nestjs/common';

import { SharedModule } from '@app/shared';

import { OutrageController } from './controllers/outrage.controller';
import { OutrageMergerService } from './services/outrage-merger.service';
import { OutrageStorageService } from './services/outrage-storage.service';

@Module({
  imports: [SharedModule],
  controllers: [OutrageController],
  providers: [OutrageMergerService, OutrageStorageService],
})
export class OutrageModule {}
