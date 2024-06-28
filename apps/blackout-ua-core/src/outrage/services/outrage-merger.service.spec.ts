import { Test, TestingModule } from '@nestjs/testing';
import { OutrageMergerService } from './outrage-merger.service';

describe('OutrageMergerService', () => {
  let service: OutrageMergerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutrageMergerService],
    }).compile();

    service = module.get<OutrageMergerService>(OutrageMergerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
