import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UkraineBaseService } from './ukraine-base.service';

describe('UkraineBaseService', () => {
  let service: UkraineBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UkraineBaseService],
    }).compile();

    service = module.get(UkraineBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
