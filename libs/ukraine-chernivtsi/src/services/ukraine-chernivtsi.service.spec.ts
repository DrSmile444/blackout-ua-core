import { Test, TestingModule } from '@nestjs/testing';
import { UkraineChernivtsiService } from './ukraine-chernivtsi.service';

describe('UkraineChernivtsiService', () => {
  let service: UkraineChernivtsiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UkraineChernivtsiService],
    }).compile();

    service = module.get<UkraineChernivtsiService>(UkraineChernivtsiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
