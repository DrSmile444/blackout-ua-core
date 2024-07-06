import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { OutrageRegion } from '../database/entities';
import { outrageMock5Change2, outrageMock6Origin, outrageMock7ChangeOld } from '../mocks';

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
      const result = outrageParserService.parseRow('Some random string');
      expect(result).toBeNull();
    });

    it('should return null if time period is found but no queues', () => {
      const result = outrageParserService.parseRow('Some random string 10:00–12:00');
      expect(result).toBeNull();
    });

    it('should return shift if time period and queues are found', () => {
      const result = outrageParserService.parseRow('Some random string 10:00–12:00 1, 2, 3');
      expect(result).toEqual({
        start: '10:00',
        end: '12:00',
        queues: ['1', '2', '3'],
      });
    });

    it('should return shift if time period and two digit queues are found', () => {
      const result = outrageParserService.parseRow('Some random string 10:00–12:00 1, 2, 13');
      expect(result).toEqual({
        start: '10:00',
        end: '12:00',
        queues: ['1', '2', '13'],
      });
    });

    it('should return shift from real new mock', () => {
      const result = outrageParserService.parseRow('01:00-02:00 1 та 2 черги');
      expect(result).toEqual({
        start: '01:00',
        end: '02:00',
        queues: ['1', '2'],
      });
    });

    it('should return shift from real new mock with multiple queues', () => {
      const result = outrageParserService.parseRow('22:00-23:00  2, 3 та 4 черги');
      expect(result).toEqual({
        start: '22:00',
        end: '23:00',
        queues: ['2', '3', '4'],
      });
    });

    it('should return shift from real old mock', () => {
      const result = outrageParserService.parseRow('➡️ 17:00 – 18:00 – 3');
      expect(result).toEqual({
        start: '17:00',
        end: '18:00',
        queues: ['3'],
      });
    });
  });

  describe('parseShifts', () => {
    it('should return empty array if message is empty', () => {
      const result = outrageParserService.parseShifts('');
      expect(result).toEqual([]);
    });

    it('should return empty array if message is not empty but no shifts', () => {
      const result = outrageParserService.parseShifts('Some random string');
      expect(result).toEqual([]);
    });

    it('should return shifts', () => {
      const result = outrageParserService.parseShifts('Some random string\n10:00–12:00 1, 2, 3\nSome random string');
      expect(result).toEqual([
        {
          start: '10:00',
          end: '12:00',
          queues: ['1', '2', '3'],
        },
      ]);
    });

    it('should return shifts from real new mock', () => {
      const result = outrageParserService.parseShifts(outrageMock6Origin);
      expect(result).toMatchSnapshot();
    });

    it('should return shifts from real old mock', () => {
      const result = outrageParserService.parseShifts(outrageMock7ChangeOld);
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

    it('should return null if the date is not found in the message', () => {
      const message = 'Some random string';
      const result = outrageParserService.parseDate(message);
      expect(result).toBeNull();
    });
  });

  describe('parseMessage', () => {
    it('should return parsed message', () => {
      const result = outrageParserService.parseMessage(outrageMock6Origin, OutrageRegion.CHERKASY);
      expect(result).toMatchSnapshot();
    });

    it('should return parsed message from real old mock', () => {
      const result = outrageParserService.parseMessage(outrageMock7ChangeOld, OutrageRegion.CHERKASY);
      expect(result).toMatchSnapshot();
    });
  });
});
