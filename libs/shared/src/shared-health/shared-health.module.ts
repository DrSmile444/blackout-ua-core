import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { SharedHealthController } from './shared-health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [SharedHealthController],
})
export class SharedHealthModule {}
