import { Module } from '@nestjs/common';
import { UkraineBaseModule } from '@ukraine/ukraine-base';
import { CityController } from './controllers/city.controller';

@Module({
  imports: [UkraineBaseModule],
  controllers: [CityController],
})
export class CityModule {}
