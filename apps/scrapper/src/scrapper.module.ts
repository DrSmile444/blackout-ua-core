import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { SharedModule } from '@app/shared';

import { UkraineScrapperModule } from '@ukraine/ukraine-base';

import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    HttpModule,
    SharedModule,
    UkraineScrapperModule,
  ],
  controllers: [ScrapperController],
  providers: [ScrapperService],
})
export class ScrapperModule {}
