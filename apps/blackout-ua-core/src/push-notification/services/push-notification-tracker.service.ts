import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import type { Shift } from '@app/shared';
import { getClearDateIsoString, userLocationTimes } from '@app/shared';

// TODO add QueueStatusDTO
export interface QueueStatus {
  queue: Date;
  shift: Shift;
  completed: boolean;
}

@Injectable()
export class PushNotificationTrackerService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private remapQueue(queue: Date, shift: Shift): QueueStatus {
    return { queue, shift, completed: false };
  }

  /**
   * Queue start
   * */
  async getQueueStarts(date: Date): Promise<QueueStatus[]> {
    return this.getQueues(`shiftStarts:${getClearDateIsoString(date)}`);
  }

  async updateQueuesStart(date: Date, queueStarts: Shift[]) {
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
  async getQueueEnds(date: Date): Promise<QueueStatus[]> {
    return this.getQueues(`shiftEnds:${getClearDateIsoString(date)}`);
  }

  async updateQueuesEnd(date: Date, queueEnds: Shift[]) {
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
  async updateQueues(date: Date, queuesShifts: Shift[], key: string) {
    const queueDates = queuesShifts.flatMap((shift) =>
      userLocationTimes.map((locationTime) => {
        const queueHours = shift.getHours();
        const queueMinutes = shift.getMinutes();

        const queueDate = new Date(date);
        queueDate.setHours(+queueHours, +queueMinutes - locationTime, 0, 0);

        return { queueDate, shift };
      }),
    );

    const previousValue = await this.getQueues(key);

    if (!previousValue) {
      return this.redis.set(key, JSON.stringify(queueDates.map((queue) => this.remapQueue(queue.queueDate, queue.shift))));
    }

    const newValue = previousValue;

    queueDates.forEach((queue) => {
      if (!newValue.some((q) => +q.queue === +queue)) {
        newValue.push(this.remapQueue(queue.queueDate, queue.shift));
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

  async initialCheck(date: Date) {
    const allStartQueues = await this.getQueueStarts(date);
    const allEndQueues = await this.getQueueEnds(date);

    const missingStartQueues = allStartQueues.filter(
      (queueStatus) =>
        !queueStatus.completed && !this.isQueueExpired(date, queueStatus.queue) && this.isQueueReached(date, queueStatus.queue),
    );

    const missingEndQueues = allEndQueues.filter(
      (queueStatus) =>
        !queueStatus.completed && !this.isQueueExpired(date, queueStatus.queue) && this.isQueueReached(date, queueStatus.queue),
    );

    return { missingStartQueues, missingEndQueues };
  }

  isQueueReached(date: Date, queue: Date): boolean {
    return date > queue;
  }

  isQueueExpired(date: Date, queue: Date): boolean {
    const expirationMinutes = 15;
    const queueExpirationDate = new Date(queue);
    queueExpirationDate.setHours(queueExpirationDate.getHours(), queueExpirationDate.getMinutes() + expirationMinutes, 0, 0);

    const now = new Date();

    return now > queueExpirationDate;
  }

  private async getQueues(key: string): Promise<QueueStatus[]> {
    return ((JSON.parse(await this.redis.get(key)) || []) as QueueStatus[]).map(
      (q): QueueStatus => ({ ...q, queue: new Date(q.queue), shift: new Date(q.shift) }),
    );
  }
}
