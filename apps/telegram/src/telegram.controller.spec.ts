import { Test, TestingModule } from '@nestjs/testing';

import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

describe('TelegramController', () => {
  let telegramController: TelegramController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TelegramController],
      providers: [TelegramService],
    }).compile();

    telegramController = app.get<TelegramController>(TelegramController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(telegramController.getHello()).toBe('Hello World!');
    });
  });
});
