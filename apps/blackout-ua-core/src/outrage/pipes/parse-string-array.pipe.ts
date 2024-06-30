import type { PipeTransform } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { coerceArray } from '@app/shared';

@Injectable()
export class ParseStringArrayPipe implements PipeTransform {
  transform(value: string | string[]): string[] {
    if (!value) {
      return [];
    }

    return coerceArray(value).flatMap((value_) => value_.split(','));
  }
}
