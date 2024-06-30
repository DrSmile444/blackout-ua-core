import { Test, TestingModule } from '@nestjs/testing';

import { UkraineTelegramService } from './ukraine-telegram.service';

describe('UkraineTelegramService', () => {
  let service: UkraineTelegramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UkraineTelegramService],
    }).compile();

    service = module.get<UkraineTelegramService>(UkraineTelegramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
