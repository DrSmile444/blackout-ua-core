import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { SharedService } from './shared.service';

describe('SharedService', () => {
  let service: SharedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedService],
    }).compile();

    service = module.get(SharedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
