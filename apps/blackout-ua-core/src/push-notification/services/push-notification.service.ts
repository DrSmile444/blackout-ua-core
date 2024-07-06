import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import type { Message } from 'firebase-admin/lib/messaging/messaging-api';

import type { OutrageRegionAndQueuesDto, UserWithFoundRegionDto } from '@app/shared';
import { OutrageService, removeDuplicates, UserService } from '@app/shared';

import { OutrageMergerService } from '../../outrage/services';
import firebaseAdmin from '../firebase-admin';

@Injectable()
export class PushNotificationService {
  private jobs: CronJob[] = [];

  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private outrageMergerService: OutrageMergerService,
    private outrageService: OutrageService,
    private userService: UserService,
  ) {
    this.createNotificationJobs().catch((error) => this.logger.error('Error creating notification jobs', error));
    // this.sendNotification('21:00');
  }

  async createNotificationJobs() {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const currentShift = this.outrageMergerService.parseTime(`${currentHour}:${currentMinute}`);

    const shifts = await this.outrageService.getShiftsForDate(new Date());
    const shiftStarts = removeDuplicates(shifts.map((shift) => shift.start)).filter(
      (shift) => this.outrageMergerService.parseTime(shift) > currentShift,
    );

    shiftStarts.forEach((shift) => this.scheduleNotification(shift));
  }

  scheduleNotification(shift: string) {
    const [hours, minutes] = shift.split(':').map((time) => Number.parseInt(time, 10));
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    const notificationTime = new Date(scheduleDate.getTime() - 15 * 60_000); // 15 minutes before the shift
    const cronTime = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${notificationTime.getMonth() + 1} *`;

    this.logger.debug(`Scheduling notification for ${shift} at ${notificationTime.toISOString()}`);

    const job = new CronJob(cronTime, () => {
      this.sendNotification(shift).catch((error) => this.logger.error('Error sending notification', error));
    });

    job.start();
    this.jobs.push(job);
  }

  async sendNotification(shift: string) {
    const outrages = await this.outrageService.getShiftAndQueuesForDateAndShiftStart(new Date(), shift);

    const requestPayload: OutrageRegionAndQueuesDto[] = outrages.map((outrage) => ({
      region: outrage.region,
      queues: outrage.shifts.flatMap((localShift) => localShift.queues.map((queue) => queue.queue)),
    }));

    const users = await this.userService.getUsersByRegionAndQueues(requestPayload);

    this.logger.debug(`Sending notification for shift ${shift} to ${users.length} users with payload: ${JSON.stringify(requestPayload)}`);

    const userSendRequests = users.map((user) => this.sendNotificationToUser(user));
    await Promise.all(userSendRequests);
  }

  async sendNotificationToUser(user: UserWithFoundRegionDto): Promise<void> {
    const { foundRegion, fcmToken, locations } = user;
    const foundLocation = locations.find((location) => location.region === foundRegion);

    if (!foundLocation) {
      this.logger.warn(`No location found for region: ${foundRegion}`);
      return;
    }

    const title = '⚠️ Відключення Світла';
    const message = `Увага! В локації '${foundLocation.name}' світла не буде через 15 хвилин. Підготуйтеся!`;

    const payload: Message = {
      token: fcmToken,
      notification: {
        title,
        body: message,
      },
    };

    try {
      await firebaseAdmin.messaging().send(payload);
      this.logger.log(`Notification sent to ${fcmToken}`);
    } catch (error) {
      this.logger.error(`Error sending notification to ${fcmToken}`, error);
    }
  }

  clearAllJobs() {
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
  }

  getAllShiftsForDate(date: Date) {
    return this.outrageService.getShiftsForDate(date);
  }
}
