export function getClearDateIsoString(date: Date): string {
  const clearDate = new Date(date);
  clearDate.setHours(0, 0, 0, 0);
  clearDate.setMinutes(clearDate.getMinutes() - clearDate.getTimezoneOffset());

  return clearDate.toISOString();
}
