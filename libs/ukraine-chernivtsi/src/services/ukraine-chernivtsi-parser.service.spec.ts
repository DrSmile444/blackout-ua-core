import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { LightStatus, OutrageParserService } from '@app/shared';

import { UkraineChernivtsiParserService } from './ukraine-chernivtsi-parser.service';

describe('UkraineChernivtsiParserService', () => {
  let service: UkraineChernivtsiParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UkraineChernivtsiParserService, OutrageParserService],
    }).compile();

    service = module.get(UkraineChernivtsiParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('parseDate', () => {
  //   it('should return date', () => {
  //     expect(service.parseDate('на 25.06.2024')).toEqual(new Date(2024, 5, 25));
  //   });
  //
  //   it('should return null', () => {
  //     expect(service.parseDate('на 25 червня 2024')).toBeNull();
  //   });
  //
  //   it('should work with real data', () => {
  //     expect(service.parseDate(outrageChernivtsiMock1Origin)).toEqual(new Date(2024, 5, 25));
  //   });
  // });

  describe('mergeQueueTimes', () => {
    it('should merge queue times', () => {
      expect(
        service.mergeQueueTimes(
          [
            {
              start: '10:00',
              end: '12:00',
              queues: [
                { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
                { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
              ],
            },
            {
              start: '12:00',
              end: '14:00',
              queues: [
                { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
                { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
              ],
            },
          ],
          [
            {
              start: '12:00',
              end: '14:00',
              queues: [
                { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
                { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
              ],
            },
            {
              start: '18:00',
              end: '20:00',
              queues: [
                { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
                { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
              ],
            },
          ],
        ),
      ).toEqual([
        {
          start: '10:00',
          end: '12:00',
          queues: [
            { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
            { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
          ],
        },
        {
          start: '12:00',
          end: '14:00',
          queues: [
            { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
            { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
            { queue: '1', lightStatus: LightStatus.UNAVAILABLE },
            { queue: '2', lightStatus: LightStatus.UNAVAILABLE },
          ],
        },
        {
          start: '18:00',
          end: '20:00',
          queues: [
            { queue: '3', lightStatus: LightStatus.UNAVAILABLE },
            { queue: '4', lightStatus: LightStatus.UNAVAILABLE },
          ],
        },
      ]);
    });
  });
});
