import { Injectable, PipeTransform } from '@nestjs/common';
import { coerceArray } from '../utils/coerce-array.util';

@Injectable()
export class ParseNumberArrayPipe implements PipeTransform {
  transform(value: string | string[]): number[] {
    return coerceArray(value)
      .map((val) => val.split(',').map(Number))
      .flat();
  }
}
