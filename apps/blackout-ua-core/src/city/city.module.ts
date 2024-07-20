import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { UkraineBaseModule } from '@ukraine/ukraine-base';

import { CityController } from './controllers/city.controller';

@Module({
  imports: [UkraineBaseModule, CacheModule.register()],
  controllers: [CityController],
})
export class CityModule {}
