import { Injectable } from '@nestjs/common';
import type { CheerioAPI } from 'cheerio/lib/load';

import type { Outrage, OutrageShift } from '@app/shared';
import { isUnavailableOrPossiblyUnavailable, LightStatus, OutrageRegion, OutrageType } from '@app/shared';

export enum ChernivtsiLightStatus {
  AVAILABLE = 'з',
  UNAVAILABLE = 'в',
  POSSIBLY_UNAVAILABLE = 'мз',
}

export const LightStatusMap: Record<ChernivtsiLightStatus, LightStatus> = {
  [ChernivtsiLightStatus.AVAILABLE]: LightStatus.AVAILABLE,
  [ChernivtsiLightStatus.UNAVAILABLE]: LightStatus.UNAVAILABLE,
  [ChernivtsiLightStatus.POSSIBLY_UNAVAILABLE]: LightStatus.POSSIBLY_UNAVAILABLE,
};

@Injectable()
export class UkraineChernivtsiParserService {
  parseMessageCheerio($: CheerioAPI): Outrage {
    const dateText = $('#gsv ul p').first().text().trim();
    const [day, month, year] = dateText.split('.');
    const date = new Date(+year, +month - 1, +day);

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

    const shifts = queues.map((queue) => {
      const outrageTypes = this.parseTimeColumn($, queue);
      const outrageShifts: OutrageShift[] = periods
        .map((period, periodIndex) => ({
          start: period.start,
          end: period.end,
          queues: [{ queue, lightStatus: LightStatusMap[outrageTypes[periodIndex]] }],
        }))
        .filter((shift) => isUnavailableOrPossiblyUnavailable(shift.queues[0].lightStatus));
      return outrageShifts;
    });

    const clearShifts = this.mergeQueueTimes(...shifts);

    return {
      type: OutrageType.SCHEDULE,
      region: OutrageRegion.CHERNIVTSI,
      date,
      shifts: clearShifts,
    };
  }

  parseTimeColumn($: CheerioAPI, queue: string): ChernivtsiLightStatus[] {
    const result = $(`#gsv div div[data-id="${queue}"] > *`);
    const rowValues = result.map((_, element) => $(element).text()).get();
    return rowValues as ChernivtsiLightStatus[];
  }

  mergeQueueTimes(...arrays: OutrageShift[][]): OutrageShift[] {
    const combinedArray = arrays.flat();
    const timeMap: Map<string, OutrageShift> = new Map();

    combinedArray.forEach((item) => {
      const key = `${item.start}-${item.end}`;
      if (timeMap.has(key)) {
        const existingItem = timeMap.get(key);
        existingItem.queues = [...new Set([...existingItem.queues, ...item.queues])];
      } else {
        timeMap.set(key, { ...item });
      }
    });

    const mergedArray = [...timeMap.values()];
    mergedArray.sort((a, b) => {
      const timeA = a.start.split(':').map(Number);
      const timeB = b.start.split(':').map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });

    return mergedArray;
  }
}
