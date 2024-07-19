import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { SharedHealthController } from './shared-health.controller';

describe('HealthController', () => {
  let controller: SharedHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharedHealthController],
    }).compile();

    controller = module.get<SharedHealthController>(SharedHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
