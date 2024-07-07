import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import type { Message } from 'firebase-admin/lib/messaging/messaging-api';

import type { OutrageRegionAndQueuesDto, User } from '@app/shared';
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
    private configService: ConfigService,
  ) {
    this.createNotificationJobs().catch((error) => this.logger.error('Error creating notification jobs', error));
    // this.sendNotification('17:00');

    const foundLocation = {
      name: 'Мій дім',
    };

    const message = {
      title: '🔴 Електропостачання вимкнеться за 15 хвилин!',
      body: `Локація '${foundLocation.name}': електропостачання з'явиться за 15 хвилин.`,
    };

    const message2 = {
      title: '🟢 Електропостачання відновиться за 15 хвилин!',
      body: `Локація '${foundLocation.name}': електропостачання припиниться через 15 хвилин.`,
    };

    // this.sendUser(this.configService.get('TEST_FCM_TOKEN_DD'), message.title, message.body);

    // this.sendUser(this.configService.get('TEST_FCM_TOKEN_DH'), message.title, message.body);
    // this.sendUser(this.configService.get('TEST_FCM_TOKEN_DH'), message2.title, message2.body);
    // const index = 4;

    // this.sendUser(this.configService.get('TEST_FCM_TOKEN_DV'), message.title, message.body);
    // this.sendUser(this.configService.get('TEST_FCM_TOKEN_DV'), message2.title, message2.body);
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

    const userSendRequests = users.map((user) => this.sendNotificationToUser(user, shift));
    await Promise.all(userSendRequests);
  }

  sendNotificationToUser(user: User, shift: string): Promise<void[]> {
    const { fcmToken, locations } = user;

    return Promise.all(
      locations.map((location) => {
        const title = '🔴 Електропостачання вимкнеться за 15 хвилин!';
        const message = `Локація '${location.name}': електропостачання припиниться через 15 хвилин (о ${shift}).`;

        return this.sendUser(fcmToken, title, message);
      }),
    );
  }

  async sendUser(fcmToken: string, title: string, body: string): Promise<void> {
    const payload: Message = {
      token: fcmToken,
      notification: {
        title,
        body,
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
