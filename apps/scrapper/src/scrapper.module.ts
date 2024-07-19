import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

import { DatabaseModule, SharedHealthModule, SharedModule } from '@app/shared';

import { UkraineScrapperModule } from '@ukraine/ukraine-base';

import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get('REDIS_URL'),
      }),
      inject: [ConfigService],
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
