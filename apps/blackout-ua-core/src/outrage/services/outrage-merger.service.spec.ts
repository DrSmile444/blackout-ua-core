import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { OutrageDto } from '@app/shared';
import {
  LightStatus,
  outrageMock3Origin,
  outrageMock4Change,
  outrageMock5Change2,
  OutrageParserService,
  OutrageRegion,
  OutrageType,
  stringToShift,
} from '@app/shared';

import { OutrageMergerService } from './outrage-merger.service';

const mockDate = new Date('2024-06-25');

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
      const outrage1: OutrageDto = {
        date: mockDate,
        type: OutrageType.SCHEDULE,
        region: OutrageRegion.CHERKASY,
        shifts: [
          {
            start: stringToShift(new Date(), '10:00'),
            end: stringToShift(new Date(), '12:00'),
            queues: [
              { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '12:00'),
            end: stringToShift(new Date(), '14:00'),
            queues: [
              { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
        ],
      };

      const outrage2: OutrageDto = {
        date: mockDate,
        type: OutrageType.CHANGE,
        region: OutrageRegion.CHERKASY,
        changeCount: 1,
        shifts: [
          {
            start: stringToShift(new Date(), '12:00'),
            end: stringToShift(new Date(), '14:00'),
            queues: [
              { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '18:00'),
            end: stringToShift(new Date(), '20:00'),
            queues: [
              { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
        ],
      };

      const expected: OutrageDto = {
        date: mockDate,
        type: OutrageType.CHANGE,
        region: OutrageRegion.CHERKASY,
        changeCount: 1,
        shifts: [
          {
            start: stringToShift(new Date(), '10:00'),
            end: stringToShift(new Date(), '12:00'),
            queues: [
              { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '12:00'),
            end: stringToShift(new Date(), '14:00'),
            queues: [
              { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '18:00'),
            end: stringToShift(new Date(), '20:00'),
            queues: [
              { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
        ],
      };

      const actual = outrageMergerService.mergeOutrages([outrage1, outrage2]);
      expect(expected).toEqual(actual);
    });

    it('should merge 2 outrages with overlapping periods', () => {
      const outrage1: OutrageDto = {
        date: mockDate,
        type: OutrageType.SCHEDULE,
        region: OutrageRegion.CHERKASY,
        shifts: [
          {
            start: stringToShift(new Date(), '10:00'),
            end: stringToShift(new Date(), '12:00'),
            queues: [
              { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '12:00'),
            end: stringToShift(new Date(), '14:00'),
            queues: [
              { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
        ],
      };

      const outrage2: OutrageDto = {
        date: mockDate,
        type: OutrageType.CHANGE,
        region: OutrageRegion.CHERKASY,
        changeCount: 1,
        shifts: [
          {
            start: stringToShift(new Date(), '13:00'),
            end: stringToShift(new Date(), '14:00'),
            queues: [
              { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '18:00'),
            end: stringToShift(new Date(), '20:00'),
            queues: [
              { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
        ],
      };

      const expected: OutrageDto = {
        date: mockDate,
        type: OutrageType.CHANGE,
        region: OutrageRegion.CHERKASY,
        changeCount: 1,
        shifts: [
          {
            start: stringToShift(new Date(), '10:00'),
            end: stringToShift(new Date(), '12:00'),
            queues: [
              { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '12:00'),
            end: stringToShift(new Date(), '13:00'),
            queues: [
              { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '13:00'),
            end: stringToShift(new Date(), '14:00'),
            queues: [
              { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
          {
            start: stringToShift(new Date(), '18:00'),
            end: stringToShift(new Date(), '20:00'),
            queues: [
              { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
              { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
            ],
          },
        ],
      };

      const actual = outrageMergerService.mergeOutrages([outrage1, outrage2]);
      expect(expected).toEqual(actual);
    });

    it('should should merge real outrages', () => {
      const outrage = outrageParserService.parseMessage(mockDate, outrageMock3Origin, OutrageRegion.CHERKASY);
      const outrageChange = outrageParserService.parseMessage(mockDate, outrageMock4Change, OutrageRegion.CHERKASY);
      const outrageChange2 = outrageParserService.parseMessage(mockDate, outrageMock5Change2, OutrageRegion.CHERKASY);

      const mergedOutrage = outrageMergerService.mergeOutrages([outrage, outrageChange, outrageChange2]);

      expect(mergedOutrage).toMatchSnapshot();
    });
  });
});
