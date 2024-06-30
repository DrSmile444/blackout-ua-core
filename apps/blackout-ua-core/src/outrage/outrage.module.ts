import { Module } from '@nestjs/common';
import { OutrageController } from './controllers/outrage.controller';
import { OutrageMergerService } from './services/outrage-merger.service';
import { OutrageStorageService } from './services/outrage-storage.service';
import { SharedModule } from '@app/shared';

@Module({
  imports: [SharedModule],
  controllers: [OutrageController],
  providers: [OutrageMergerService, OutrageStorageService],
})
export class OutrageModule {}
