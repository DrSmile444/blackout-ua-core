// transformers.ts
import type { TransformFnParams } from 'class-transformer';

export function dateTransform({ value }: TransformFnParams) {
  if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
    return new Date(value);
  }

  throw new Error('Invalid date format');
}
