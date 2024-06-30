import { Injectable } from '@nestjs/common';
import { Outrage } from '@app/shared';

@Injectable()
export class OutrageMergerService {
  parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  mergeOutrages(outrages: Outrage[]): Outrage {
    let currentOutrage = outrages[0];

    outrages.slice(1).forEach((newOutrage) => {
      const newFirstShift = newOutrage.shifts[0];
      const newFirstShiftTime = this.parseTime(newFirstShift.start);

      currentOutrage.shifts = currentOutrage.shifts.filter((oldShift) => {
        const oldShiftTime = this.parseTime(oldShift.start);
        return oldShiftTime < newFirstShiftTime;
      });

      const lastCurrentShift = currentOutrage.shifts.at(-1);

      if (
        lastCurrentShift &&
        this.parseTime(lastCurrentShift.end) >
          this.parseTime(newFirstShift.start)
      ) {
        lastCurrentShift.end = newFirstShift.start;
      }

      currentOutrage.shifts = [...currentOutrage.shifts, ...newOutrage.shifts];
      currentOutrage = {
        ...newOutrage,
        shifts: currentOutrage.shifts,
      };
    });

    return currentOutrage;
  }
}
