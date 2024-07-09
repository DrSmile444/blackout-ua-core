/**
 * Returns the keys of an object with correct types.
 *
 * @template T - The type of the object.
 * @param {T} value - The object to get the keys from.
 * @returns {keyof T} - The keys of the object with the correct types.
 */
export const typedObjectKeysUtil = <T extends object>(value: T): (keyof T)[] =>
  Object.keys(value) as unknown as (keyof T)[];

/**
 * Returns the values of an object with correct types.
 *
 * @template T - The type of the object.
 * @param {T} value - The object to get the keys from.
 * @returns {keyof T} - The keys of the object with the correct types.
 */
export const typedObjectValuesUtil = <T extends object>(
  value: T
): T[keyof T][] => Object.values(value) as unknown as T[keyof T][];
