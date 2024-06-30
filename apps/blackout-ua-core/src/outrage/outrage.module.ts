import { Module } from '@nestjs/common';

import { SharedModule } from '@app/shared';

import { OutrageController } from './controllers/outrage.controller';
import { OutrageMergerService } from './services/outrage-merger.service';

@Module({
  imports: [SharedModule],
  controllers: [OutrageController],
  providers: [OutrageMergerService],
})
export class OutrageModule {}
