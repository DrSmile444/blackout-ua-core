import { Module } from '@nestjs/common';

import { CityModule } from './city/city.module';
import { OutrageModule } from './outrage/outrage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [OutrageModule, CityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
