import type { OnModuleInit } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { CronJob } from 'cron';
import type { Message } from 'firebase-admin/lib/messaging/messaging-api';

import type { NotificationLeadTime, Outrage, OutrageRegion, OutrageRegionAndQueuesDto, User, UserLocation } from '@app/shared';
import {
  isUnavailableOrPossiblyUnavailable,
  OutrageService,
  OutrageType,
  removeDuplicates,
  typedObjectKeysUtil,
  userLocationTimes,
  UserService,
} from '@app/shared';

import { OutrageMergerService } from '../../outrage/services';
import firebaseAdmin from '../firebase-admin';

import { PushNotificationTrackerService } from './push-notification-tracker.service';

export type ShiftType = 'start' | 'end';

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private jobs: CronJob[] = [];

  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private pushNotificationTrackerService: PushNotificationTrackerService,
    private outrageMergerService: OutrageMergerService,
    private outrageService: OutrageService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  onModuleInit(): any {
    this.createNotificationJobs().catch((error) => this.logger.error('Error creating notification jobs', error));
    // this.test();
  }

  async test() {
    // const times = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    const times = ['13:00'];
    for (const time of times) {
      await this.sendNotification(time, 'start', 15);
      await this.sendNotification(time, 'end', 15);
    }
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

  @OnEvent('outrages.new')
  async createNotificationJobs() {
    this.clearAllJobs();
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

    // for (const shift of shiftStarts) {
    //   await this.scheduleNotification(shift, 'start');
    // }
    //
    // for (const shift of shiftEnds) {
    //   await this.scheduleNotification(shift, 'end');
    // }

    shiftStarts.forEach((shift) => this.scheduleNotification(shift, 'start'));
    shiftEnds.forEach((shift) => this.scheduleNotification(shift, 'end'));

    if (shiftStarts.length === 0) {
      this.logger.debug('No shifts to schedule notifications for');
    }
  }

  @OnEvent('outrages.new')
  async notifyAboutChange(newOutrages: Outrage[]) {
    const updatedOutrages = newOutrages.filter((outrage) => outrage.type === OutrageType.CHANGE);
    const requestPayload: OutrageRegionAndQueuesDto[] = updatedOutrages.map((outrage) => ({
      region: outrage.region,
      queues: outrage.shifts.flatMap((localShift) => localShift.queues.map((queue) => queue.queue)),
    }));

    const users = await this.userService.getUsersByRegionQueues(requestPayload);

    this.logger.debug(
      `Sending notification about changing in outrages to ${users.length} users to ${users.reduce((accumulator, user) => accumulator + user.locations.length, 0)} locations with payload: ${JSON.stringify(requestPayload)}`,
    );

    const userSendRequests = users.map((user) => this.sendChangeTimeNotificationToUser(user));

    await Promise.all(userSendRequests);
  }

  async scheduleNotification(shift: string, type: ShiftType) {
    const [hours, minutes] = shift.split(':').map((time) => Number.parseInt(time, 10));
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    const notificationTimes = userLocationTimes.map((leadTime) => {
      const notificationTime = new Date(scheduleDate.getTime() - leadTime * 60_000); // 15 minutes before the shift
      const cronTime = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${notificationTime.getMonth() + 1} *`;

      // this.logger.debug(`Scheduling notification for ${type} ${shift} at ${notificationTime.toISOString()}`);

      const job = new CronJob(cronTime, () => {
        this.sendNotification(shift, type, leadTime).catch((error) => this.logger.error('Error sending notification', error));
      });

      job.start();
      this.jobs.push(job);

      return notificationTime;
    });

    // switch (type) {
    //   case 'start': {
    //     await this.pushNotificationTrackerService.updateQueuesStart(new Date(), notificationTimes);
    //     break;
    //   }
    //   case 'end': {
    //     await this.pushNotificationTrackerService.updateQueuesEnd(new Date(), notificationTimes);
    //     break;
    //   }
    //   default: {
    //     break;
    //   }
    // }
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

    const users = await this.userService.getUsersByRegionQueuesLead(requestPayload, leadTime);

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

    const clearUsers = users
      .map(
        (user): User => ({
          ...user,
          locations: user.locations.filter((location) => !this.checkIfLocationWithoutElectricity(location, clearOutrages, shift, type)),
        }),
      )
      .filter((user) => user.locations.length > 0);

    this.logger.debug(
      `Sending notification for shift ${shift} ${type} with lead time ${leadTime} to ${users.length} users to ${clearUsers.reduce((accumulator, user) => accumulator + user.locations.length, 0)} locations with payload: ${JSON.stringify(requestPayload)}`,
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

    const shiftDate = new Date();
    const [hours, minutes] = shift.split(':').map((time) => Number.parseInt(time, 10));
    shiftDate.setHours(hours, minutes - leadTime, 0, 0);

    switch (type) {
      case 'start': {
        await this.pushNotificationTrackerService.completeQueueStart(new Date(), shiftDate);
        break;
      }
      case 'end': {
        await this.pushNotificationTrackerService.completeQueueEnd(new Date(), shiftDate);
        break;
      }
      default: {
        break;
      }
    }
  }

  checkIfLocationWithoutElectricity(location: UserLocation, outrages: Outrage[], shift: string, type: ShiftType): boolean {
    const locationOutrage = outrages.find((outrage) => outrage.region === location.region);

    switch (type) {
      case 'start': {
        return this.checkIfLocationWithoutElectricityStart(location, locationOutrage, shift);
      }
      case 'end': {
        return this.checkIfLocationWithElectricityEnd(location, locationOutrage, shift);
      }

      default: {
        return false;
      }
    }
  }

  /**
   * Check if location has no electricity at the start of the shift
   * @return {boolean} true if location has no electricity, false otherwise
   * */
  checkIfLocationWithoutElectricityStart(location: UserLocation, locationOutrage: Outrage, shift: string): boolean {
    const previousShift = locationOutrage.shifts.find((localShift) => localShift.end === shift);

    if (!previousShift) {
      return false;
    }

    return previousShift.queues.some((queue) => {
      const isQueueSame = queue.queue === location.queue;
      const isLocationHasNoLight = isUnavailableOrPossiblyUnavailable(queue.lightStatus);

      return isQueueSame && isLocationHasNoLight;
    });
  }

  /**
   * Check if location has no electricity at the end of the shift
   * @return {boolean} true if location has no electricity, false otherwise
   * */
  checkIfLocationWithElectricityEnd(location: UserLocation, locationOutrage: Outrage, shift: string): boolean {
    const nextShift = locationOutrage.shifts.find((localShift) => localShift.start === shift);

    if (!nextShift) {
      return false;
    }

    return nextShift.queues.some((queue) => {
      const isQueueSame = queue.queue === location.queue;
      const isLocationHasNoLight = isUnavailableOrPossiblyUnavailable(queue.lightStatus);

      return isQueueSame && isLocationHasNoLight;
    });
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

  sendChangeTimeNotificationToUser(user: User): Promise<void[]> {
    const { fcmToken, locations } = user;

    return Promise.all(
      locations.map((location) => {
        const title = `⚠️ Зміни в графіку електропостачань!`;
        const message = `Локація “${location.name}” змінила графіки електропостання. Відкрийте застосунок, щоб побачити актуальні.`;

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
    this.logger.debug('All jobs cleared');
  }

  getAllShiftsForDate(date: Date) {
    return this.outrageService.getShiftsForDate(date);
  }
}
