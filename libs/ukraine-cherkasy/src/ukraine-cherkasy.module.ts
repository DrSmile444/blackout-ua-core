import { Module } from '@nestjs/common';
import { UkraineCherkasyService } from './ukraine-cherkasy.service';
import { SharedModule } from '@app/shared';

@Module({
  imports: [SharedModule],
  providers: [UkraineCherkasyService],
  exports: [UkraineCherkasyService],
})
export class UkraineCherkasyModule {}
