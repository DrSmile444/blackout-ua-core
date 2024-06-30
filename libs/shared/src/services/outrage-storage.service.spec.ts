import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { OutrageStorageService } from './outrage-storage.service';

describe('OutrageStorageService', () => {
  let service: OutrageStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutrageStorageService],
    }).compile();

    service = module.get(OutrageStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
