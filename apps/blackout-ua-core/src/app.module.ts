import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { CityModule } from './city/city.module';
import { OutrageModule } from './outrage/outrage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UpdateModule } from './update/update.module';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    OutrageModule,
    CityModule,
    UpdateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
