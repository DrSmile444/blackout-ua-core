import type { PipeTransform } from '@nestjs/common';
import { BadRequestException, Injectable } from '@nestjs/common';

import { OutrageRegion } from '@app/shared';

@Injectable()
export class ValidRegionPipe implements PipeTransform {
  transform(value: string): OutrageRegion {
    const isRegionExist = Object.values(OutrageRegion).includes(value as OutrageRegion);
    if (!isRegionExist) {
      throw new BadRequestException(`Region does not exist. Use one of the following: ${Object.values(OutrageRegion).join(', ')}`);
    }

    return value as OutrageRegion;
  }
}
