import type { Shift } from '../database';

export function getClearDateIsoString(date: Date): string {
  const clearDate = new Date(date);
  clearDate.setHours(0, 0, 0, 0);
  clearDate.setMinutes(clearDate.getMinutes() - clearDate.getTimezoneOffset());

  return clearDate.toISOString();
}

export function shiftToDate(date: Date, shift: Shift): Date {
  const [hours, minutes] = shift.split(':').map((time) => Number.parseInt(time, 10));
  const shiftDate = new Date(date);
  shiftDate.setHours(hours, minutes, 0, 0);
  return shiftDate;
}
