import { Module } from '@nestjs/common';
import { UkraineCherkasyModule } from '@ukraine/ukraine-cherkasy';
import { UkraineBaseService } from './services';

@Module({
  imports: [UkraineCherkasyModule],
  providers: [UkraineBaseService],
  exports: [UkraineBaseService],
})
export class UkraineBaseModule {}
