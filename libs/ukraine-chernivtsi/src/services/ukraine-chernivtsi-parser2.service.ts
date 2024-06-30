import { Injectable } from '@nestjs/common';
import type { CheerioAPI } from 'cheerio/lib/load';

import type { Outrage, OutrageShift } from '@app/shared';
import { OutrageParserService, OutrageRegion, OutrageType } from '@app/shared';

export enum OutrageMapType {
  MAYBE = 'мз',
  NO = 'в',
}

@Injectable()
export class UkraineChernivtsiParserService extends OutrageParserService {
  parseMessageCheerio($: CheerioAPI): Outrage {
    const dateText = $('#gsv ul p').first().text().trim();
    const queues = $('#gsv ul li')
      .map((_, element) => $(element).text().trim().match(/\d+/))
      .get();

    const periods = $('#gsv div > p:first > u > b')
      .map((_, element) => $(element).text().trim())
      .get()
      // Combine periods with start and end
      .map((period, index, array) => ({ start: period, end: array[index + 1] }))
      // Remove last period because it doesn't have end
      .slice(0, -1);

    queues.map((queue, index) => {
      const outrageTypes = this.parseTimeColumn($, queue);
      const outrageShifts: OutrageShift[] = periods
        .map((period, periodIndex) => ({
          start: period.start,
          end: period.end,
          queues: [queue],
        }))
        .filter((shift, shiftIndex) => [OutrageMapType.MAYBE, OutrageMapType.NO].includes(outrageTypes[shiftIndex]));
      console.log(outrageShifts);
    });

    // console.log({ periods, queues, dateText });

    // console.log(periods);
    this.parseTimeColumn($, queues[0]);

    // const date = new Date(dateText);
    //
    // console.log(queues);
    //
    // const times = $('#gsv div p u')
    //   .map((_, element) => $(element).text().trim().replace('<em>', '').replace('</em>', ''))
    //   .get();
    //
    // const outrages: Outrage[] = [];
    //
    // $('#gsv div div[id^="inf"]').each((_, element) => {
    //   const shifts: OutrageShift[] = [];
    //   const shiftsMap = $(element)
    //     .find('u, o, s')
    //     .map((index, element_) => ({
    //       type: $(element_).prop('tagName').toLowerCase(),
    //       active: $(element_).hasClass('active'),
    //     }))
    //     .get();
    //
    //   let currentShift: OutrageShift | null = null;
    //
    //   shiftsMap.forEach((shift, index) => {
    //     const time = times[index];
    //
    //     if (shift.type === 'u' || shift.type === 'o') {
    //       if (currentShift) {
    //         currentShift.end = time;
    //         shifts.push(currentShift);
    //       }
    //       currentShift = {
    //         start: time,
    //         end: '',
    //         queues: [],
    //       };
    //     }
    //
    //     if (currentShift && shift.active) {
    //       currentShift.queues.push(Number.parseInt($(element).closest('div').attr('data-id')));
    //     }
    //   });
    //
    //   if (currentShift) {
    //     currentShift.end = times.at(-1);
    //     shifts.push(currentShift);
    //   }
    //
    //   outrages.push({
    //     type: OutrageType.SCHEDULE,
    //     region: OutrageRegion.CHERKASY,
    //     date,
    //     shifts,
    //   });
    // });

    // console.log({ dateText, date, outrages, times });

    return null;
  }

  parseTimeColumn($: CheerioAPI, queue: string): OutrageMapType[] {
    const result = $(`#gsv div div[data-id="${queue}"] > *`);
    const rowValues = result.map((_, element) => $(element).text()).get();
    console.log(rowValues);
    return rowValues as OutrageMapType[];
  }

  mergeQueueTimes(array1: QueueTime[], array2: QueueTime[]): QueueTime[] {
    const combinedArray = [...array1, ...array2];
    const timeMap: Map<string, QueueTime> = new Map();

    combinedArray.forEach((item) => {
      const key = `${item.start}-${item.end}`;
      if (timeMap.has(key)) {
        const existingItem = timeMap.get(key)!;
        existingItem.queues = Array.from(new Set([...existingItem.queues, ...item.queues]));
      } else {
        timeMap.set(key, { ...item });
      }
    });

    const mergedArray = Array.from(timeMap.values());
    mergedArray.sort((a, b) => {
      const timeA = a.start.split(':').map(Number);
      const timeB = b.start.split(':').map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });

    return mergedArray;
  }

  REGEX_EXTRAS = {
    date: /на (\d{2}.\d{2}.\d{4})/,
  };

  parseMessage(message: string): Outrage {
    const type = this.parseType(message);
    const date = this.parseDate(message);
    const shifts = this.parseShifts(message);

    return {
      type,
      region: OutrageRegion.CHERNIVTSI,
      date: date || new Date(),
      shifts,
    };
  }

  parseDate(message: string): Date | null {
    const dateMatch = this.REGEX.date.exec(message);

    if (dateMatch && dateMatch[1]) {
      const [day, month, year] = dateMatch[1].split('.');

      return new Date(+year, +month - 1, +day);
    }

    return null;
  }

  parseRow(row: string): OutrageShift | null {
    const time = this.parseTime(row);
    const queues = this.parseQueue(row);

    if (!time || queues.length === 0) {
      return null;
    }

    return {
      start: time[0],
      end: time[1],
      queues,
    };
  }
}
