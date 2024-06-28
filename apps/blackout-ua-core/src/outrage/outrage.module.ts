import { Module } from '@nestjs/common';
import { OutrageService } from './outrage.service';
import { OutrageController } from './outrage.controller';

@Module({
  providers: [OutrageService],
  controllers: [OutrageController]
})
export class OutrageModule {}
