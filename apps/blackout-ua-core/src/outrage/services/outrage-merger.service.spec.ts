import { Test, TestingModule } from '@nestjs/testing';

import { OutrageParserService } from '@app/shared';
import { Outrage, OutrageType } from '@app/shared';

import {
  outrageMock3Origin,
  outrageMock4Change,
  outrageMock5Change2,
} from '../mocks/outrage.mock';

import { OutrageMergerService } from './outrage-merger.service';

describe('OutrageMergerService', () => {
  let outrageMergerService: OutrageMergerService;
  let outrageParserService: OutrageParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutrageMergerService, OutrageParserService],
    }).compile();

    outrageMergerService = module.get(OutrageMergerService);
    outrageParserService = module.get(OutrageParserService);
  });

  describe('parseTime', () => {
    it('should return time in minutes', () => {
      const result = outrageMergerService.parseTime('10:30');
      expect(result).toEqual(630);
    });
  });

  describe('mergeOutrages', () => {
    it('should merge 2 outrages', () => {
      const outrage1: Outrage = {
        date: new Date('2024-06-25'),
        type: OutrageType.SCHEDULE,
        shifts: [
          { start: '10:00', end: '12:00', queues: [1, 2] },
          { start: '12:00', end: '14:00', queues: [3, 4] },
        ],
      };

      const outrage2: Outrage = {
        date: new Date('2024-06-25'),
        type: OutrageType.CHANGE,
        changeCount: 1,
        shifts: [
          { start: '12:00', end: '14:00', queues: [1, 2] },
          { start: '18:00', end: '20:00', queues: [3, 4] },
        ],
      };

      const expected: Outrage = {
        date: new Date('2024-06-25'),
        type: OutrageType.CHANGE,
        changeCount: 1,
        shifts: [
          { start: '10:00', end: '12:00', queues: [1, 2] },
          { start: '12:00', end: '14:00', queues: [1, 2] },
          { start: '18:00', end: '20:00', queues: [3, 4] },
        ],
      };

      const actual = outrageMergerService.mergeOutrages([outrage1, outrage2]);
      expect(expected).toEqual(actual);
    });

    it('should merge 2 outrages with overlapping periods', () => {
      const outrage1: Outrage = {
        date: new Date('2024-06-25'),
        type: OutrageType.SCHEDULE,
        shifts: [
          { start: '10:00', end: '12:00', queues: [1, 2] },
          { start: '12:00', end: '14:00', queues: [3, 4] },
        ],
      };

      const outrage2: Outrage = {
        date: new Date('2024-06-25'),
        type: OutrageType.CHANGE,
        changeCount: 1,
        shifts: [
          { start: '13:00', end: '14:00', queues: [1, 2] },
          { start: '18:00', end: '20:00', queues: [3, 4] },
        ],
      };

      const expected: Outrage = {
        date: new Date('2024-06-25'),
        type: OutrageType.CHANGE,
        changeCount: 1,
        shifts: [
          { start: '10:00', end: '12:00', queues: [1, 2] },
          { start: '12:00', end: '13:00', queues: [3, 4] },
          { start: '13:00', end: '14:00', queues: [1, 2] },
          { start: '18:00', end: '20:00', queues: [3, 4] },
        ],
      };

      const actual = outrageMergerService.mergeOutrages([outrage1, outrage2]);
      expect(expected).toEqual(actual);
    });

    it('should should merge real outrages', () => {
      const outrage = outrageParserService.parseMessage(outrageMock3Origin);
      const outrageChange =
        outrageParserService.parseMessage(outrageMock4Change);
      const outrageChange2 =
        outrageParserService.parseMessage(outrageMock5Change2);

      const mergedOutrage = outrageMergerService.mergeOutrages([
        outrage,
        outrageChange,
        outrageChange2,
      ]);

      expect(mergedOutrage).toMatchSnapshot();
    });
  });
});
