import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import * as deepEqual from 'fast-deep-equal';
import Redis from 'ioredis';

import type { Outrage, OutrageRegion } from '@app/shared';

const storageKey = 'outrage';

@Injectable()
export class OutrageStorageService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async saveOutrage(outrage: Outrage): Promise<Outrage> {
    const baseKey = this.getBaseKey(outrage.date, outrage.region);
    const currentOutrages = await this.getOutragesKeys(outrage.date, outrage.region);

    const previousOutrages = await this.getOutrages(outrage.date, outrage.region);
    const createdOutrage = previousOutrages.find((previousOutrage) =>
      deepEqual({ ...previousOutrage, changeCount: 0 }, { ...outrage, changeCount: 0 }),
    );

    if (createdOutrage) {
      console.info('Skipping outrage creation, already exists');
      return createdOutrage;
    }

    const newKey = `${baseKey}:${currentOutrages.length}`;
    const newOutrage = { ...outrage, changeCount: currentOutrages.length };

    await this.redis.set(baseKey, JSON.stringify([...currentOutrages, newKey]));
    await this.redis.set(newKey, JSON.stringify(newOutrage));

    return newOutrage;
  }

  async bulkSaveOutrages(outrages: Outrage[]): Promise<Outrage[]> {
    const newOutrages: Outrage[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const outrage of outrages) {
      // eslint-disable-next-line no-await-in-loop
      const previousOutrages = await this.getOutrages(outrage.date, outrage.region);
      const createdOutrage = previousOutrages.find((previousOutrage) =>
        deepEqual({ ...previousOutrage, changeCount: 0 }, { ...outrage, changeCount: 0 }),
      );

      if (!createdOutrage) {
        // eslint-disable-next-line no-await-in-loop
        const savedOutrage = await this.saveOutrage(outrage);
        newOutrages.push(savedOutrage);
      }
    }

    return newOutrages;
  }

  async getOutragesKeys(date: Date, region: OutrageRegion): Promise<string[]> {
    const baseKey = this.getBaseKey(date, region);
    const currentOutrages = await this.redis.get(baseKey);
    return currentOutrages ? (JSON.parse(currentOutrages) as string[]) : [];
  }

  async getOutrages(date: Date, region: OutrageRegion): Promise<Outrage[]> {
    const keys = await this.getOutragesKeys(date, region);
    const rawOutrages = keys.length > 0 ? await this.redis.mget(keys) : [];
    return rawOutrages.filter(Boolean).map((outrageString) => this.parseOutrage(outrageString));
  }

  parseOutrage(outrageString: string): Outrage {
    const outrageParsed = JSON.parse(outrageString) as Outrage;
    return { ...outrageParsed, date: new Date(outrageParsed.date) };
  }

  async getOutragesByQueue(date: Date, region: OutrageRegion, queues: string | string[]): Promise<Outrage[]> {
    const coerceQueues = Array.isArray(queues) ? queues : [queues];
    const outrages = await this.getOutrages(date, region);
    return outrages.map((outrage) => ({
      ...outrage,
      shifts: outrage.shifts.filter((shift) => coerceQueues.some((queue) => shift.queues.some((shiftQueue) => shiftQueue.queue === queue))),
    }));
  }

  async getRawStorage(): Promise<Record<string, Outrage | string[]>> {
    const keys = await this.redis.keys(`${storageKey}:*:*`);
    const storageRaw = await this.redis.mget(keys);
    const storage: Record<string, Outrage | string[]> = {};

    keys.forEach((key, index) => {
      const value = JSON.parse(storageRaw[index]) as Outrage | string[];
      storage[key] = value;
    });

    return storage;
  }

  private getBaseKey(date: Date, region: OutrageRegion): string {
    return `${storageKey}:${region}:${this.getKeyDate(date)}`;
  }

  private getKeyDate(date: Date): string {
    return date.toLocaleDateString().replaceAll('/', '-');
  }

  // We need to remove all keys which starts with 'outrage' to clear all storage
  private async clearAllStorage() {
    return this.redis.del(await this.redis.keys('outrage:*'));
  }
}
