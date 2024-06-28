import { Injectable } from '@nestjs/common';
import { Outrage, OutrageShift, OutrageType } from '../entities/outrage.entity';

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
    date: /відключень на (\d+) (\W+)/i,
    queue: /\d+/g,
    time: /\d{2}:\d{2}/g,
    timePeriod: /\d{2}:\d{2} ?[–-]? ?\d{2}:\d{2}/,
  };

  parseMessage(message: string): Outrage {
    const type = this.parseType(message);
    const date = this.parseDate(message);
    const shifts = this.parseShifts(message);

    return {
      type,
      date: date || new Date(),
      shifts,
    };
  }

  private parseType(message: string): OutrageType {
    return message.toLowerCase().includes('зміни')
      ? OutrageType.CHANGE
      : OutrageType.SCHEDULE;
  }

  private parseDate(message: string): Date | null {
    const currentYear = new Date().getFullYear();

    const rows = message
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let date: Date | null = null;

    rows.some((row) => {
      const textDate = this.REGEX.date.exec(row);

      if (textDate) {
        const [, day, month] = textDate;
        const monthStarts = Object.keys(this.UKRAINIAN_MONTH_MAP);
        const monthIndex = monthStarts.findIndex((monthStart) =>
          month.toLowerCase().startsWith(monthStart),
        );

        if (monthIndex) {
          date = new Date(currentYear, monthIndex, +day);
          return true;
        }
      }

      return false;
    });

    return date;
  }

  private parseShifts(message: string): OutrageShift[] {
    const rows = message
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return rows
      .map((row) => this.parseRow(row))
      .filter((shift) => shift !== null) as OutrageShift[];
  }

  private parseRow(row: string): OutrageShift | null {
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

  private parseTime(row: string): [string, string] | null {
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

  private parseQueue(row: string): number[] {
    const timePeriod = this.REGEX.timePeriod.exec(row)?.[0];

    if (!timePeriod) {
      return [];
    }

    const clearRow = row.replace(timePeriod, '').trim();
    const queues = clearRow.match(this.REGEX.queue) || [];

    return queues.map((queue: string) => Number.parseInt(queue, 10));
  }
}
