import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';

import { OutrageService, removeDuplicates, UserService } from '@app/shared';

@Injectable()
export class PushNotificationService {
  private jobs: CronJob[] = [];

  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private outrageService: OutrageService,
    private userService: UserService,
  ) {
    // this.createNotificationJobs();
    // this.scheduleNotification('20:56');
    this.sendNotification('21:00');
  }

  async createNotificationJobs() {
    const shifts = removeDuplicates((await this.outrageService.getShiftsForDate(new Date())).map((shift) => shift.start));
    console.log(shifts);
    shifts.forEach((shift) => this.scheduleNotification(shift));
  }

  scheduleNotification(shift: string) {
    const [hours, minutes] = shift.split(':').map((time) => Number.parseInt(time, 10));
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    const notificationTime = new Date(scheduleDate.getTime() - 15 * 60_000); // 15 minutes before the shift
    const cronTime = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${notificationTime.getMonth() + 1} *`;

    this.logger.debug(`Scheduling notification for ${shift} at ${notificationTime}`);

    const job = new CronJob(cronTime, () => {
      this.sendNotification(shift);
    });

    job.start();
    this.jobs.push(job);
  }

  async sendNotification(shift: string) {
    const outrages = await this.outrageService.getShiftAndQueuesForDateAndShiftStart(new Date(), shift);
    console.log('cron works!!', outrages);
    // const users = this.userService.getUsersByRegionAndS;
    // console.log(`Sending notification to user ${userId}`);
    // Add your notification logic here
  }

  clearAllJobs() {
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
  }

  getAllShiftsForDate(date: Date) {
    return this.outrageService.getShiftsForDate(date);
  }
}
