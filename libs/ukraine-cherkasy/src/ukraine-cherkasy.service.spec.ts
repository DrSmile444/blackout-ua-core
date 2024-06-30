import { Test, TestingModule } from '@nestjs/testing';

import { UkraineCherkasyService } from './ukraine-cherkasy.service';

describe('UkraineCherkasyService', () => {
  let service: UkraineCherkasyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UkraineCherkasyService],
    }).compile();

    service = module.get<UkraineCherkasyService>(UkraineCherkasyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
