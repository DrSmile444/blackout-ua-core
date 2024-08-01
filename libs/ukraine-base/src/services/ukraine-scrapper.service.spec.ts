import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UkraineScrapperService } from './ukraine-scrapper.service';

describe('UkraineScrapperService', () => {
  let service: UkraineScrapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UkraineScrapperService],
    }).compile();

    service = module.get<UkraineScrapperService>(UkraineScrapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
