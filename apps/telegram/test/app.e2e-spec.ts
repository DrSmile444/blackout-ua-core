// eslint-disable-next-line unicorn/prevent-abbreviations
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { TelegramModule } from '../src/telegram.module';

describe('TelegramController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TelegramModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  it('/ (GET)', () => request(app.getHttpServer()).get('/').expect(200).expect('Hello World!'));
});
