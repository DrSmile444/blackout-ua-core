import { Module } from '@nestjs/common';

import { SharedModule } from '@app/shared';

import { UkraineCherkasyService } from './ukraine-cherkasy.service';

@Module({
  imports: [SharedModule],
  providers: [UkraineCherkasyService],
  exports: [UkraineCherkasyService],
})
export class UkraineCherkasyModule {}
