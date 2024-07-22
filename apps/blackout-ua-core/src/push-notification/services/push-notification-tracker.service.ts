import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { getClearDateIsoString, userLocationTimes } from '@app/shared';

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
  async updateQueuesStart(date: Date, queueStarts: string[]) {
    const key = `shiftStarts:${getClearDateIsoString(date)}`;
    return this.updateQueues(date, queueStarts, key);
  }

  async completeQueueStart(date: Date, queue: Date) {
    const key = `shiftStarts:${getClearDateIsoString(date)}`;
    return this.completeQueue(queue, key);
  }

  /**
   * Queue end
   * */
  async updateQueuesEnd(date: Date, queueEnds: string[]) {
    const key = `shiftEnds:${getClearDateIsoString(date)}`;
    return this.updateQueues(date, queueEnds, key);
  }

  async completeQueueEnd(date: Date, queue: Date) {
    const key = `shiftEnds:${getClearDateIsoString(date)}`;
    return this.completeQueue(queue, key);
  }

  /**
   * Queue utils
   * */
  async updateQueues(date: Date, queues: string[], key: string) {
    const queueDates = queues.flatMap((queue) =>
      userLocationTimes.map((locationTime) => {
        const [queueHours, queueMinutes] = queue.split(':');

        const queueDate = new Date(date);
        queueDate.setHours(+queueHours, +queueMinutes - locationTime, 0, 0);

        return queueDate;
      }),
    );

    const previousValue = await this.getQueues(key);

    if (!previousValue) {
      return this.redis.set(key, JSON.stringify(queueDates.map((queue) => this.remapQueue(queue))));
    }

    const newValue = previousValue;

    queueDates.forEach((queue) => {
      if (!newValue.some((q) => +q.queue === +queue)) {
        newValue.push(this.remapQueue(queue));
      }
    });

    return this.redis.set(key, JSON.stringify(newValue));
  }

  async completeQueue(queue: Date, key: string) {
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
