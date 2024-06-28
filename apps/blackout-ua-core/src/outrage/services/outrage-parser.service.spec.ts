import { Test, TestingModule } from '@nestjs/testing';
import { OutrageParserService } from './outrage-parser.service';

describe('OutrageParserService', () => {
  let service: OutrageParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutrageParserService],
    }).compile();

    service = module.get<OutrageParserService>(OutrageParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
