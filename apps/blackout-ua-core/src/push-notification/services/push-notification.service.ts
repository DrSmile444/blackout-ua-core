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

export type ShiftType = 'start' | 'end';

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
    this.test();
  }

  async test() {
    // await this.sendNotification('20:00', 'start', 15);
    // await this.sendNotification('20:00', 'end', 15);
    // await this.sendNotification('21:00', 'start', 15);
    // await this.sendNotification('21:00', 'end', 15);
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
    // this.userService.deleteAll();
  }

  async createNotificationJobs() {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const currentShift = this.outrageMergerService.parseTime(`${currentHour}:${currentMinute}`);

    const shifts = await this.outrageService.getShiftsForDate(new Date());
    const shiftStarts = removeDuplicates(shifts.map((shift) => shift.start)).filter(
      (shift) => this.outrageMergerService.parseTime(shift) > currentShift,
    );
    const shiftEnds = removeDuplicates(shifts.map((shift) => shift.end)).filter(
      (shift) => this.outrageMergerService.parseTime(shift) > currentShift,
    );

    shiftStarts.forEach((shift) => this.scheduleNotification(shift, 'start'));
    shiftEnds.forEach((shift) => this.scheduleNotification(shift, 'end'));

    if (shiftStarts.length === 0) {
      this.logger.debug('No shifts to schedule notifications for');
    }
  }

  scheduleNotification(shift: string, type: ShiftType) {
    const [hours, minutes] = shift.split(':').map((time) => Number.parseInt(time, 10));
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    userLocationTimes.forEach((leadTime) => {
      const notificationTime = new Date(scheduleDate.getTime() - leadTime * 60_000); // 15 minutes before the shift
      const cronTime = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${notificationTime.getMonth() + 1} *`;

      this.logger.debug(`Scheduling notification for ${type} ${shift} at ${notificationTime.toISOString()}`);

      const job = new CronJob(cronTime, () => {
        this.sendNotification(shift, type, leadTime).catch((error) => this.logger.error('Error sending notification', error));
      });

      job.start();
      this.jobs.push(job);
    });
  }

  async sendNotification(shift: string, type: ShiftType, leadTime: NotificationLeadTime) {
    const outrages =
      type === 'start'
        ? await this.outrageService.getShiftAndQueuesForDateAndShiftStart(new Date(), shift)
        : type === 'end'
          ? await this.outrageService.getShiftAndQueuesForDateAndShiftEnd(new Date(), shift)
          : [];

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
        locations: user.locations.filter((location) => !this.checkIfLocationWithoutElectricity(location, clearOutrages, shift, type)),
      }),
    );

    this.logger.debug(
      `Sending notification for shift ${shift} ${type} with lead time ${leadTime} to ${users.length} users with ${clearUsers.reduce((accumulator, user) => accumulator + user.locations.length, 0)} with payload: ${JSON.stringify(requestPayload)}`,
    );

    const userSendRequests = clearUsers.map((user) => {
      switch (type) {
        case 'start': {
          return this.sendDisableNotificationToUser(user, shift, leadTime);
        }
        case 'end': {
          return this.sendEnableNotificationToUser(user, shift, leadTime);
        }
        default: {
          return Promise.resolve([]);
        }
      }
    });
    await Promise.all(userSendRequests);
  }

  checkIfLocationWithoutElectricity(location: UserLocation, outrages: Outrage[], shift: string, type: ShiftType): boolean {
    const locationOutrage = outrages.find((outrage) => outrage.region === location.region);

    switch (type) {
      case 'start': {
        return this.checkIfLocationWithoutElectricityStart(location, locationOutrage, shift);
      }
      case 'end': {
        return this.checkIfLocationWithoutElectricityEnd(location, locationOutrage, shift);
      }
      default: {
        return false;
      }
    }
  }

  checkIfLocationWithoutElectricityStart(location: UserLocation, locationOutrage: Outrage, shift: string): boolean {
    const previousShift = locationOutrage.shifts.find((localShift) => localShift.end === shift);

    if (!previousShift) {
      return false;
    }

    return previousShift.queues.some((queue) => queue.queue === location.queue && isUnavailableOrPossiblyUnavailable(queue.lightStatus));
  }

  checkIfLocationWithoutElectricityEnd(location: UserLocation, locationOutrage: Outrage, shift: string): boolean {
    const nextShift = locationOutrage.shifts.find((localShift) => localShift.start === shift);

    if (!nextShift) {
      return false;
    }

    return nextShift.queues.some((queue) => queue.queue === location.queue && !isUnavailableOrPossiblyUnavailable(queue.lightStatus));
  }

  sendDisableNotificationToUser(user: User, shift: string, leadTime: NotificationLeadTime): Promise<void[]> {
    const { fcmToken, locations } = user;

    return Promise.all(
      locations.map((location) => {
        const title = `🔴 Електропостачання вимкнеться через ${leadTime} хвилин!`;
        const message = `Локація “${location.name}”: електропостачання припиниться через ${leadTime} хвилин (о ${shift}). Будь ласка, перевірте чи всі пристрої заряджені!`;

        return this.sendUser(fcmToken, title, message);
      }),
    );
  }

  sendEnableNotificationToUser(user: User, shift: string, leadTime: NotificationLeadTime): Promise<void[]> {
    const { fcmToken, locations } = user;

    return Promise.all(
      locations.map((location) => {
        const title = `🟢 Електропостачання включиться через ${leadTime} хвилин!`;
        const message = `Локація “${location.name}”: електропостачання з'явиться через ${leadTime} хвилин (о ${shift}).`;

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
