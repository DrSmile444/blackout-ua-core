import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class RequiredQueryParamPipe implements PipeTransform {
  transform<T>(value: T, metadata: ArgumentMetadata): T {
    if (!value) {
      throw new BadRequestException(`Query parameter '${metadata.data}' is required`);
    }
    return value;
  }
}
