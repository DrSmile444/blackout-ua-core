import type { PipeTransform } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { coerceArray } from '@app/shared';

@Injectable()
export class ParseNumberArrayPipe implements PipeTransform {
  transform(value: string | string[]): number[] {
    if (!value) {
      return [];
    }

    return coerceArray(value).flatMap((value_) => value_.split(',').map(Number));
  }
}
