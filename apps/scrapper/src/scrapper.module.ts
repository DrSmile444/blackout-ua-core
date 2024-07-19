import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { DatabaseModule, SharedHealthModule, SharedModule } from '@app/shared';

import { UkraineScrapperModule } from '@ukraine/ukraine-base';

import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    DatabaseModule,
    HttpModule,
    SharedModule,
    UkraineScrapperModule,
    SharedHealthModule,
  ],
  controllers: [ScrapperController],
  providers: [ScrapperService],
})
export class ScrapperModule {}
