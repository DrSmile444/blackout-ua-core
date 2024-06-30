import { Injectable } from '@nestjs/common';

import type { Outrage } from '@app/shared';

const storageKey = 'outrage';
const regionKey = 'cherkasy';
const storage: Record<string, Outrage | string[]> = {};

@Injectable()
export class OutrageStorageService {
  saveOutrage(outrage: Outrage): Outrage {
    const baseKey = this.getBaseKey(outrage.date);
    const currentOutrages = this.getOutragesKeys(outrage.date);
    const newKey = `${baseKey}:${currentOutrages.length}`;
    const newOutrage = { ...outrage, changeCount: currentOutrages.length };

    storage[baseKey] = [...currentOutrages, newKey];
    storage[newKey] = newOutrage;

    return newOutrage;
  }

  getOutragesKeys(date: Date): string[] {
    const baseKey = this.getBaseKey(date);
    const currentOutrages = storage[baseKey] || [];

    if (!Array.isArray(currentOutrages) || currentOutrages.length === 0) {
      return [];
    }

    return currentOutrages;
  }

  getOutrages(date: Date): Outrage[] {
    const keys = this.getOutragesKeys(date);
    return keys.map((key) => storage[key] as Outrage);
  }

  getOutragesByQueue(date: Date, queues: number | number[]): Outrage[] {
    const coerceQueues = Array.isArray(queues) ? queues : [queues];
    const outrages = this.getOutrages(date);
    return outrages.map((outrage) => ({
      ...outrage,
      shifts: outrage.shifts.filter((shift) => coerceQueues.some((queue) => shift.queues.includes(queue))),
    }));
  }

  getRawStorage() {
    return storage;
  }

  private getBaseKey(date: Date): string {
    return `${storageKey}:${regionKey}:${this.getKeyDate(date)}`;
  }

  private getKeyDate(date: Date): string {
    return date.toLocaleDateString().replaceAll('/', '-');
  }
}
