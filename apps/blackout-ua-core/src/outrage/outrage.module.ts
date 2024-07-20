import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { DatabaseModule, SharedModule } from '@app/shared';

import { UpdateModule } from '../update/update.module';

import { OutrageController } from './controllers/outrage.controller';
import { OutrageMergerService } from './services';

@Module({
  imports: [SharedModule, UpdateModule, DatabaseModule, CacheModule.register()],
  controllers: [OutrageController],
  providers: [OutrageMergerService],
})
export class OutrageModule {}
