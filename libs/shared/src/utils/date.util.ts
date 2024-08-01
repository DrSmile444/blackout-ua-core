import type { Shift } from '../database';

export function getClearDate(date: Date): Date {
  const clearDate = new Date(date);
  clearDate.setHours(0, 0, 0, 0);
  clearDate.setMinutes(clearDate.getMinutes() - clearDate.getTimezoneOffset());

  return clearDate;
}

export function getClearDateIsoString(date: Date): string {
  const clearDate = new Date(date);
  clearDate.setHours(0, 0, 0, 0);
  clearDate.setMinutes(clearDate.getMinutes() - clearDate.getTimezoneOffset());

  return clearDate.toISOString();
}

export function stringToShift(date: Date, shiftString: string): Shift {
  const [hours, minutes] = shiftString.split(':').map((time) => Number.parseInt(time, 10));
  const shiftDate = new Date(date);
  shiftDate.setHours(hours, minutes, 0, 0);
  return shiftDate;
}

export function shiftToString(date: Shift): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
