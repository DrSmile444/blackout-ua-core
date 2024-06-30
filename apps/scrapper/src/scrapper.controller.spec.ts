import { Test, TestingModule } from '@nestjs/testing';
import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';

describe('ScrapperController', () => {
  let scrapperController: ScrapperController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ScrapperController],
      providers: [ScrapperService],
    }).compile();

    scrapperController = app.get<ScrapperController>(ScrapperController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(scrapperController.getHello()).toBe('Hello World!');
    });
  });
});
