import type { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export const getEnumDescription = (enumName: string, enumObject: Record<string, string | number> | any[]) => {
  if (Array.isArray(enumObject)) {
    return `
export enum ${enumName} {
${enumObject.map((value, index) => `  ${index} = ${typeof value === 'string' ? `"${value}"` : value},`).join('\n')}
`;
  }

  const allValues = Object.values(enumObject);
  const keys = Object.keys(enumObject).filter((key) =>
    allValues.some((value) => typeof value === 'number') ? allValues.includes(key) : true,
  );
  const values = allValues.filter((value) => !keys.includes(value as string));

  return `
export enum ${enumName} {
${keys.map((key, index) => `  ${key} = ${typeof values[index] === 'string' ? `"${values[index]}"` : values[index]},`).join('\n')}
}
`;
};

export const useEnum =
  <T extends ApiPropertyOptions>() =>
  <S extends T>(options: S): S & Pick<T, 'description'> => ({
    description: getEnumDescription(options.enumName, options.enum),
    ...options,
  });
