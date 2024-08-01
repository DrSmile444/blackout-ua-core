import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { OutrageService } from './outrage.service';

describe('OutrageService', () => {
  let service: OutrageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutrageService],
    }).compile();

    service = module.get<OutrageService>(OutrageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
