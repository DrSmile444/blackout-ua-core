import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: any): Date | undefined {
    if (value === undefined || value === null) {
      return undefined; // Allow the value to be optional
    }

    return new Date(value);
  }
}
