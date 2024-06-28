import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OutrageModule } from './outrage/outrage.module';
import { CityModule } from './city/city.module';

@Module({
  imports: [OutrageModule, CityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
