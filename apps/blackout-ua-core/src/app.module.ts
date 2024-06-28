import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OutrageModule } from './outrage/outrage.module';

@Module({
  imports: [OutrageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
