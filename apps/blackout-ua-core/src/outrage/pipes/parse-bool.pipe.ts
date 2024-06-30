import type { PipeTransform } from '@nestjs/common';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(value: string): boolean | undefined {
    if (value === undefined || value === null) {
      return undefined; // Allow the value to be optional
    }

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    throw new BadRequestException(`Validation failed. "${value}" is not a boolean.`);
  }
}
