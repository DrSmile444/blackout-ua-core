import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { getClearDateIsoString } from '@app/shared';

export interface QueueStatus {
  queue: Date;
  completed: boolean;
}

@Injectable()
export class PushNotificationTrackerService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private remapQueue(queue: Date): QueueStatus {
    return { queue, completed: false };
  }

  /**
   * Queue start
   * */
  async updateQueuesStart(date: Date, queueStarts: Date[]) {
    const key = `shiftStarts:${getClearDateIsoString(date)}`;
    const previousValue = await this.getQueues(key);

    if (!previousValue) {
      return this.redis.set(key, JSON.stringify(queueStarts.map((queue) => this.remapQueue(queue))));
    }

    let newValue = previousValue;

    queueStarts.forEach((queue) => {
      if (!newValue.some((q) => +q.queue === +queue)) {
        newValue.push(this.remapQueue(queue));
      }
    });

    newValue = newValue.filter((q) => !this.isQueueExpired(date, q.queue));

    return this.redis.set(key, JSON.stringify(newValue));
  }

  async completeQueueStart(date: Date, queue: Date) {
    const key = `shiftStarts:${getClearDateIsoString(date)}`;
    const previousValue = await this.getQueues(key);

    if (!previousValue) {
      return;
    }

    const queueIndex = previousValue.findIndex((q) => +q.queue === +queue);

    if (queueIndex === -1) {
      return;
    }

    previousValue[queueIndex].completed = true;

    await this.redis.set(key, JSON.stringify(previousValue));
  }

  /**
   * Queue end
   * */
  async updateQueuesEnd(date: Date, queueEnds: Date[]) {
    const key = `shiftEnds:${getClearDateIsoString(date)}`;
    const previousValue = await this.getQueues(key);

    if (!previousValue) {
      return this.redis.set(key, JSON.stringify(queueEnds.map((queue) => this.remapQueue(queue))));
    }

    const newValue = previousValue;

    queueEnds.forEach((queue) => {
      if (!newValue.some((q) => +q.queue === +queue)) {
        newValue.push(this.remapQueue(queue));
      }
    });

    return this.redis.set(key, JSON.stringify(newValue));
  }

  async completeQueueEnd(date: Date, queue: Date) {
    const key = `shiftEnds:${getClearDateIsoString(date)}`;
    const previousValue = await this.getQueues(key);

    if (!previousValue) {
      return;
    }

    const queueIndex = previousValue.findIndex((q) => +q.queue === +queue);

    if (queueIndex === -1) {
      return;
    }

    previousValue[queueIndex].completed = true;

    await this.redis.set(key, JSON.stringify(previousValue));
  }

  /**
   * Queue utils
   * */
  isQueueExpired(date: Date, queue: Date): boolean {
    const expirationMinutes = 15;
    const queueExpirationDate = new Date(queue);
    queueExpirationDate.setHours(queueExpirationDate.getHours(), queueExpirationDate.getMinutes() + expirationMinutes, 0, 0);

    const now = new Date();

    return now > queueExpirationDate;
  }

  private async getQueues(key: string): Promise<QueueStatus[]> {
    return ((JSON.parse(await this.redis.get(key)) || []) as QueueStatus[]).map((q): QueueStatus => ({ ...q, queue: new Date(q.queue) }));
  }
}
