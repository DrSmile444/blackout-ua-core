import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import * as deepEqual from 'fast-deep-equal';
import Redis from 'ioredis';

import type { Outrage } from '@app/shared';

const storageKey = 'outrage';
const regionKey = 'cherkasy';

@Injectable()
export class OutrageStorageService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async saveOutrage(outrage: Outrage): Promise<Outrage> {
    const baseKey = this.getBaseKey(outrage.date);
    const currentOutrages = await this.getOutragesKeys(outrage.date);

    const previousOutrages = await this.getOutrages(outrage.date);
    const createdOutrage = previousOutrages.find((previousOutrage) =>
      deepEqual({ ...previousOutrage, changeCount: 0 }, { ...outrage, changeCount: 0 }),
    );

    if (createdOutrage) {
      return createdOutrage;
    }

    const newKey = `${baseKey}:${currentOutrages.length}`;
    const newOutrage = { ...outrage, changeCount: currentOutrages.length };

    await this.redis.set(baseKey, JSON.stringify([...currentOutrages, newKey]));
    await this.redis.set(newKey, JSON.stringify(newOutrage));

    return newOutrage;
  }

  async getOutragesKeys(date: Date): Promise<string[]> {
    const baseKey = this.getBaseKey(date);
    const currentOutrages = await this.redis.get(baseKey);
    return currentOutrages ? (JSON.parse(currentOutrages) as string[]) : [];
  }

  async getOutrages(date: Date): Promise<Outrage[]> {
    const keys = await this.getOutragesKeys(date);
    const rawOutrages = await this.redis.mget(keys);
    return rawOutrages.filter(Boolean).map((outrageString) => this.parseOutrage(outrageString));
  }

  parseOutrage(outrageString: string): Outrage {
    const outrageParsed = JSON.parse(outrageString) as Outrage;
    return { ...outrageParsed, date: new Date(outrageParsed.date) };
  }

  async getOutragesByQueue(date: Date, queues: number | number[]): Promise<Outrage[]> {
    const coerceQueues = Array.isArray(queues) ? queues : [queues];
    const outrages = await this.getOutrages(date);
    return outrages.map((outrage) => ({
      ...outrage,
      shifts: outrage.shifts.filter((shift) => coerceQueues.some((queue) => shift.queues.includes(queue))),
    }));
  }

  async getRawStorage(): Promise<Record<string, Outrage | string[]>> {
    const keys = await this.redis.keys(`${storageKey}:${regionKey}:*`);
    const storageRaw = await this.redis.mget(keys);
    const storage: Record<string, Outrage | string[]> = {};

    keys.forEach((key, index) => {
      const value = JSON.parse(storageRaw[index]) as Outrage | string[];
      storage[key] = value;
    });

    return storage;
  }

  private getBaseKey(date: Date): string {
    return `${storageKey}:${regionKey}:${this.getKeyDate(date)}`;
  }

  private getKeyDate(date: Date): string {
    return date.toLocaleDateString().replaceAll('/', '-');
  }
}
