import { Injectable } from '@nestjs/common';

import type { OutrageDto } from '@app/shared';

@Injectable()
export class OutrageMergerService {
  parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  mergeOutragesByRegion(outrages: OutrageDto[]): OutrageDto[] {
    const mergedOutrages: OutrageDto[] = [];
    const regions = [...new Set(outrages.map((outrage) => outrage.region))];

    regions.forEach((region) => {
      const regionOutrages = outrages.filter((outrage) => outrage.region === region);
      const mergedOutrage = this.mergeOutrages(regionOutrages);
      mergedOutrages.push(mergedOutrage);
    });

    return mergedOutrages;
  }

  mergeOutrages(outrages: OutrageDto[]): OutrageDto {
    let currentOutrage = outrages[0];

    outrages.slice(1).forEach((newOutrage) => {
      const newFirstShift = newOutrage.shifts[0];

      currentOutrage.shifts = currentOutrage.shifts.filter((oldShift) => oldShift.start < newFirstShift.start);

      const lastCurrentShift = currentOutrage.shifts.at(-1);

      if (lastCurrentShift && lastCurrentShift.end > newFirstShift.start) {
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
