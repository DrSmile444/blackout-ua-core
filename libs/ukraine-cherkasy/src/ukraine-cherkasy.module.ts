import { Module } from '@nestjs/common';
import { UkraineCherkasyService } from './ukraine-cherkasy.service';

@Module({
  providers: [UkraineCherkasyService],
  exports: [UkraineCherkasyService],
})
export class UkraineCherkasyModule {}
