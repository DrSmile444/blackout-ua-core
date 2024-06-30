import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UpdateController } from './update.controller';
import { UpdateService } from './update.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [UpdateController],
  providers: [UpdateService],
})
export class UpdateModule {}
