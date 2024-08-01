import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { OutrageRegion } from '../database/entities';
import { outrageMock5Change2, outrageMock6Origin, outrageMock7ChangeOld, outrageMock8ChangeEdge, outrageMock9ChangeEdge } from '../mocks';

import { OutrageParserService } from './outrage-parser.service';

describe('OutrageParserService', () => {
  let outrageParserService: OutrageParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutrageParserService],
    }).compile();

    outrageParserService = module.get(OutrageParserService);
  });

  describe('parseTime', () => {
    it('should return null if time period is not found', () => {
      const result = outrageParserService.parseTime('Some random string');
      expect(result).toBeNull();
    });

    it('should return null if start time is not found', () => {
      const result = outrageParserService.parseTime('Some random string 10:00–');
      expect(result).toBeNull();
    });

    it('should return null if end time is not found', () => {
      const result = outrageParserService.parseTime('Some random string –10:00');
      expect(result).toBeNull();
    });

    it('should return time period', () => {
      const result = outrageParserService.parseTime('Some random string 10:00–12:00');
      expect(result).toEqual(['10:00', '12:00']);
    });

    it('should return time period with spaces', () => {
      const result = outrageParserService.parseTime('Some random string 10:00 – 12:00');
      expect(result).toEqual(['10:00', '12:00']);
    });

    it('should return time period with dash', () => {
      const result = outrageParserService.parseTime('Some random string 10:00 - 12:00');
      expect(result).toEqual(['10:00', '12:00']);
    });

    it('should return time period with dash and spaces', () => {
      const result = outrageParserService.parseTime('Some random string 10:00 - 12:00');
      expect(result).toEqual(['10:00', '12:00']);
    });

    it('should return time period from real new mock', () => {
      const result = outrageParserService.parseTime(outrageMock6Origin);
      expect(result).toEqual(['00:00', '01:00']);
    });

    it('should return time period from real old mock', () => {
      const result = outrageParserService.parseTime(outrageMock7ChangeOld);
      expect(result).toEqual(['14:00', '15:00']);
    });

    // TODO add this logic
    // it('should return time period with dash and spaces and end time without minutes', () => {
    //   const result = outrageParserService.parseTime('Some random string 10:00 - 12');
    //   expect(result).toEqual(['10:00', '12']);
    // });
  });

  describe('parseQueue', () => {
    it('should return empty array if time period is not found', () => {
      const result = outrageParserService.parseQueue('Some random string');
      expect(result).toEqual([]);
    });

    it('should return empty array if time period is found but no queues', () => {
      const result = outrageParserService.parseQueue('Some random string 10:00–12:00');
      expect(result).toEqual([]);
    });

    it('should return queues', () => {
      const result = outrageParserService.parseQueue('Some random string 10:00–12:00 1, 2, 3');
      expect(result).toEqual(['1', '2', '3']);
    });

    it('should return 2 digit queues', () => {
      const result = outrageParserService.parseQueue('Some random string 10:00–12:00 1, 2, 13');
      expect(result).toEqual(['1', '2', '13']);
    });

    it('should return queues from real new mock', () => {
      const result = outrageParserService.parseQueue('01:00-02:00 1 та 2 черги');
      expect(result).toEqual(['1', '2']);
    });

    it('should return queues from real old mock', () => {
      const result = outrageParserService.parseQueue('➡️ 17:00 – 18:00 – 3');
      expect(result).toEqual(['3']);
    });
  });

  describe('parseRow', () => {
    it('should return null if time period is not found', () => {
      const result = outrageParserService.parseRow(new Date(), 'Some random string');
      expect(result).toBeNull();
    });

    it('should return null if time period is found but no queues', () => {
      const result = outrageParserService.parseRow(new Date(), 'Some random string 10:00–12:00');
      expect(result).toBeNull();
    });

    it('should return shift if time period and queues are found', () => {
      const result = outrageParserService.parseRow(new Date(), 'Some random string 10:00–12:00 1, 2, 3');
      expect(result).toEqual({
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(12, 0, 0, 0)),
        queues: [
          {
            lightStatus: 1,
            queue: '1',
          },
          {
            lightStatus: 1,
            queue: '2',
          },
          {
            lightStatus: 1,
            queue: '3',
          },
        ],
      });
    });

    it('should return shift if time period and two digit queues are found', () => {
      const result = outrageParserService.parseRow(new Date(), 'Some random string 10:00–12:00 1, 2, 13');
      expect(result).toEqual({
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(12, 0, 0, 0)),
        queues: [
          {
            lightStatus: 1,
            queue: '1',
          },
          {
            lightStatus: 1,
            queue: '2',
          },
          {
            lightStatus: 1,
            queue: '13',
          },
        ],
      });
    });

    it('should return shift from real new mock', () => {
      const result = outrageParserService.parseRow(new Date(), '01:00-02:00 1 та 2 черги');
      expect(result).toEqual({
        start: new Date(new Date().setHours(1, 0, 0, 0)),
        end: new Date(new Date().setHours(2, 0, 0, 0)),
        queues: [
          {
            lightStatus: 1,
            queue: '1',
          },
          {
            lightStatus: 1,
            queue: '2',
          },
        ],
      });
    });

    it('should return shift from real new mock with multiple queues', () => {
      const result = outrageParserService.parseRow(new Date(), '22:00-23:00  2, 3 та 4 черги');
      expect(result).toEqual({
        start: new Date(new Date().setHours(22, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 0, 0, 0)),
        queues: [
          {
            lightStatus: 1,
            queue: '2',
          },
          {
            lightStatus: 1,
            queue: '3',
          },
          {
            lightStatus: 1,
            queue: '4',
          },
        ],
      });
    });

    it('should return shift from real old mock', () => {
      const result = outrageParserService.parseRow(new Date(), '➡️ 17:00 – 18:00 – 3');
      expect(result).toEqual({
        start: new Date(new Date().setHours(17, 0, 0, 0)),
        end: new Date(new Date().setHours(18, 0, 0, 0)),
        queues: [
          {
            lightStatus: 1,
            queue: '3',
          },
        ],
      });
    });
  });

  describe('parseShifts', () => {
    it('should return empty array if message is empty', () => {
      const result = outrageParserService.parseShifts(new Date(), '');
      expect(result).toEqual([]);
    });

    it('should return empty array if message is not empty but no shifts', () => {
      const result = outrageParserService.parseShifts(new Date(), 'Some random string');
      expect(result).toEqual([]);
    });

    it('should return shifts', () => {
      const result = outrageParserService.parseShifts(new Date(), 'Some random string\n10:00–12:00 1, 2, 3\nSome random string');
      expect(result).toEqual([
        {
          start: new Date(new Date().setHours(10, 0, 0, 0)),
          end: new Date(new Date().setHours(12, 0, 0, 0)),
          queues: [
            {
              lightStatus: 1,
              queue: '1',
            },
            {
              lightStatus: 1,
              queue: '2',
            },
            {
              lightStatus: 1,
              queue: '3',
            },
          ],
        },
      ]);
    });

    it('should return shifts from real new mock', () => {
      const result = outrageParserService.parseShifts(new Date(), outrageMock6Origin);
      expect(result).toMatchSnapshot();
    });

    it('should return shifts from real old mock', () => {
      const result = outrageParserService.parseShifts(new Date(), outrageMock7ChangeOld);
      expect(result).toMatchSnapshot();
    });
  });

  describe('parseDate', () => {
    it('should correctly parse the date from the message', () => {
      const message = 'відключень на 15 лютого';
      const result = outrageParserService.parseDate(message);
      const expectedDate = new Date(new Date().getFullYear(), 1, 15);
      expect(result).toEqual(expectedDate);
    });

    it('should correctly parse the date from real message', () => {
      const result = outrageParserService.parseDate(outrageMock5Change2);
      const expectedDate = new Date(new Date().getFullYear(), 5, 24);
      expect(result).toEqual(expectedDate);
    });

    it('should correctly parse the date from real message 2', () => {
      const result = outrageParserService.parseDate(outrageMock7ChangeOld);
      const expectedDate = new Date(new Date().getFullYear(), 5, 11);
      expect(result).toEqual(expectedDate);
    });

    it('should correctly parse the date from the message 3', () => {
      const result = outrageParserService.parseDate(outrageMock8ChangeEdge);
      const expectedDate = new Date(2024, 6, 5);
      expect(result).toEqual(expectedDate);
    });

    it('should correctly parse the date from the message 3', () => {
      const result = outrageParserService.parseDate(outrageMock9ChangeEdge);
      const expectedDate = new Date(2024, 6, 7);
      expect(result).toEqual(expectedDate);
    });

    it('should return null if the date is not found in the message', () => {
      const message = 'Some random string';
      const result = outrageParserService.parseDate(message);
      expect(result).toBeNull();
    });
  });

  describe('parseMessage', () => {
    it('should return parsed message', () => {
      const result = outrageParserService.parseMessage(new Date(), outrageMock6Origin, OutrageRegion.CHERKASY);
      expect(result).toMatchSnapshot();
    });

    it('should return parsed message from real old mock', () => {
      const result = outrageParserService.parseMessage(new Date(), outrageMock7ChangeOld, OutrageRegion.CHERKASY);
      expect(result).toMatchSnapshot();
    });
  });
});
