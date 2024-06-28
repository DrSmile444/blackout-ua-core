import { Test, TestingModule } from '@nestjs/testing';
import { OutrageController } from './outrage.controller';

describe('OutrageController', () => {
  let controller: OutrageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OutrageController],
    }).compile();

    controller = module.get<OutrageController>(OutrageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
