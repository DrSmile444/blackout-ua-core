import { Test, TestingModule } from '@nestjs/testing';
import { OutrageController } from './outrage.controller';
import { OutrageModule } from '../outrage.module';

describe('OutrageController', () => {
  let controller: OutrageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OutrageModule],
    }).compile();

    controller = module.get(OutrageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
