import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { TelegramHealthController } from './telegram-health.controller';

describe('HealthController', () => {
  let controller: TelegramHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramHealthController],
    }).compile();

    controller = module.get<TelegramHealthController>(TelegramHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
