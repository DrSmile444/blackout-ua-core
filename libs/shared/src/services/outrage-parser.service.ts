import { Injectable } from '@nestjs/common';

import type { OutrageDto, OutrageShiftDto } from '@app/shared/database';
import { getClearDate, stringToShift } from '@app/shared/utils';

import type { OutrageRegion } from '../database/entities';
import { LightStatus, OutrageType } from '../database/entities';

@Injectable()
export class OutrageParserService {
  UKRAINIAN_MONTH_MAP = {
    січ: 0,
    лют: 1,
    берез: 2,
    квіт: 3,
    трав: 4,
    черв: 5,
    лип: 6,
    серп: 7,
    верес: 8,
    жовт: 9,
    листопад: 10,
    груд: 11,
  };

  REGEX = {
    date: / на (\d+) (\W+)/i,
    secondDate: /(\d+) (\W+)/i,
    queue: /\d+/g,
    time: /\d{2}:\d{2}/g,
    timePeriod: /\d{2}:\d{2} ?[–-]? ?\d{2}:\d{2}/,
  };

  OUTRAGE_CHANGE_TRIGGERS = ['оновлені', 'зміни'];

  // TODO include message date
  parseMessage(date: Date, message: string, region: OutrageRegion): OutrageDto {
    const clearDate = getClearDate(date);
    const parsedDate = this.parseDate(message);

    const useDate = parsedDate || clearDate;

    const type = this.parseType(message);
    const shifts = this.parseShifts(useDate, message);

    return {
      type,
      region,
      date: useDate || null,
      shifts,
    };
  }

  parseType(message: string): OutrageType {
    return this.OUTRAGE_CHANGE_TRIGGERS.some((trigger) => message.toLowerCase().includes(trigger))
      ? OutrageType.CHANGE
      : OutrageType.SCHEDULE;
  }

  parseDate(message: string): Date | null {
    const currentYear = new Date().getFullYear();

    const rows = message
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let date: Date | null = null;

    rows.some((row) => {
      const textDate = this.REGEX.date.exec(row);
      const secondTextDate = this.REGEX.secondDate.exec(row);

      if (textDate || secondTextDate) {
        const [, day, month] = textDate || secondTextDate;
        const monthStarts = Object.keys(this.UKRAINIAN_MONTH_MAP);
        const monthIndex = monthStarts.findIndex((monthStart) => month.toLowerCase().startsWith(monthStart));

        if (monthIndex) {
          date = new Date(currentYear, monthIndex, +day);
          // date = new Date(`${currentYear}-${+monthIndex + 1}-${day}`);
          return true;
        }
      }

      return false;
    });

    return date;
  }

  parseShifts(date: Date, message: string): OutrageShiftDto[] {
    const rows = message
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return rows.map((row) => this.parseRow(date, row)).filter((shift) => shift !== null);
  }

  parseRow(date: Date, row: string): OutrageShiftDto | null {
    const time = this.parseTime(row);
    const queues = this.parseQueue(row).map((queue) => ({ queue, lightStatus: LightStatus.UNAVAILABLE }));

    if (!time || queues.length === 0) {
      return null;
    }

    return {
      start: stringToShift(date, time[0]),
      end: stringToShift(date, time[1]),
      queues,
    };
  }

  parseTime(row: string): [string, string] | null {
    const timePeriod = this.REGEX.timePeriod.exec(row)?.[0];

    if (!timePeriod) {
      return null;
    }

    const [start, end] = timePeriod.match(this.REGEX.time) || [];

    if (!start || !end) {
      return null;
    }

    return [start, end];
  }

  parseQueue(row: string): string[] {
    const timePeriod = this.REGEX.timePeriod.exec(row)?.[0];

    if (!timePeriod) {
      return [];
    }

    const clearRow = row.replace(timePeriod, '').trim();
    return clearRow.match(this.REGEX.queue) || [];
  }
}
