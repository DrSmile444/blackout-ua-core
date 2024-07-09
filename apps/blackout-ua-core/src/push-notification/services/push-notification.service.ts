import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import type { Message } from 'firebase-admin/lib/messaging/messaging-api';

import type { NotificationLeadTime, Outrage, OutrageRegion, OutrageRegionAndQueuesDto, User, UserLocation } from '@app/shared';
import {
  isUnavailableOrPossiblyUnavailable,
  LightStatus,
  OutrageService,
  removeDuplicates,
  typedObjectKeysUtil,
  userLocationTimes,
  UserService,
} from '@app/shared';

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
    // this.sendNotification('20:00', 15);

    // const foundLocation: UserLocation = {
    //   id: '',
    //   name: 'Мій дім',
    //   region: OutrageRegion.CHERKASY,
    //   active: true,
    //   queue: '1',
    //   notificationLeadTime: 60,
    //   user: null,
    // };

    // const user: User = {
    //   id: '',
    //   deviceId: '',
    //   fcmToken: this.configService.get('TEST_FCM_TOKEN_DV'),
    //   locations: [foundLocation],
    // };
    //
    // this.sendNotificationToUser(user, '17:00', foundLocation.notificationLeadTime);
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

    if (shiftStarts.length === 0) {
      this.logger.debug('No shifts to schedule notifications for');
    }
  }

  scheduleNotification(shift: string) {
    const [hours, minutes] = shift.split(':').map((time) => Number.parseInt(time, 10));
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    userLocationTimes.forEach((leadTime) => {
      const notificationTime = new Date(scheduleDate.getTime() - leadTime * 60_000); // 15 minutes before the shift
      const cronTime = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${notificationTime.getMonth() + 1} *`;

      this.logger.debug(`Scheduling notification for ${shift} at ${notificationTime.toISOString()}`);

      const job = new CronJob(cronTime, () => {
        this.sendNotification(shift, leadTime).catch((error) => this.logger.error('Error sending notification', error));
      });

      job.start();
      this.jobs.push(job);
    });
  }

  async sendNotification(shift: string, leadTime: NotificationLeadTime) {
    const outrages = await this.outrageService.getShiftAndQueuesForDateAndShiftStart(new Date(), shift);

    const requestPayload: OutrageRegionAndQueuesDto[] = outrages.map((outrage) => ({
      region: outrage.region,
      queues: outrage.shifts.flatMap((localShift) => localShift.queues.map((queue) => queue.queue)),
    }));

    const users = await this.userService.getUsersByRegionAndQueues(requestPayload, leadTime);

    const todayOutrages = await this.outrageService.getAllLatestOutrages(new Date());
    // eslint-disable-next-line unicorn/no-array-reduce
    const outragesByRegion = todayOutrages.reduce(
      (accumulator, outrage) => {
        accumulator[outrage.region] = [...(accumulator[outrage.region] || []), outrage];
        return accumulator;
      },
      {} as Record<OutrageRegion, Outrage[]>,
    );

    const clearOutrages = typedObjectKeysUtil(outragesByRegion).map((region) =>
      this.outrageMergerService.mergeOutrages(outragesByRegion[region]),
    );

    const clearUsers = users.map(
      (user): User => ({
        ...user,
        locations: user.locations.filter((location) => !this.checkIfLocationWithoutElectricity(location, clearOutrages, shift)),
      }),
    );

    this.logger.debug(
      `Sending notification for shift ${shift} with lead time ${leadTime} to ${users.length} users with ${clearUsers.reduce((accumulator, user) => accumulator + user.locations.length, 0)} with payload: ${JSON.stringify(requestPayload)}`,
    );

    const userSendRequests = clearUsers.map((user) => this.sendNotificationToUser(user, shift, leadTime));
    await Promise.all(userSendRequests);
  }

  checkIfLocationWithoutElectricity(location: UserLocation, outrages: Outrage[], shift: string): boolean {
    const locationOutrage = outrages.find((outrage) => outrage.region === location.region);
    const previousShift = locationOutrage.shifts.find((localShift) => localShift.end === shift);

    if (!previousShift) {
      return false;
    }

    return previousShift.queues.some((queue) => queue.queue === location.queue && isUnavailableOrPossiblyUnavailable(queue.lightStatus));
  }

  sendNotificationToUser(user: User, shift: string, leadTime: NotificationLeadTime): Promise<void[]> {
    const { fcmToken, locations } = user;

    return Promise.all(
      locations.map((location) => {
        const title = `🔴 Електропостачання вимкнеться через ${leadTime} хвилин!`;
        const message = `Локація “${location.name}”: електропостачання припиниться через ${leadTime} хвилин (о ${shift}). Будь ласка, перевірте чи всі пристрої заряджені!`;

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
