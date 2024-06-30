import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { CityController } from './city.controller';

describe('CityController', () => {
  let controller: CityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
    }).compile();

    controller = module.get(CityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
