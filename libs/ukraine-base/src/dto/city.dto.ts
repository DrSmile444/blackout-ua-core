import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import type { CityMetadata } from '../interfaces';

export class CityMetadataDto implements CityMetadata {
  @ApiProperty({ example: 'Cherkasy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'cherkasy' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: ['1', '2', '4'] })
  @IsArray()
  @IsNotEmpty()
  queues: string[];
}
