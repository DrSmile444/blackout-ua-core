import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { OutrageRegion } from '@app/shared';

import type { CityMetadata } from '../interfaces';

export class CityMetadataDto implements CityMetadata {
  @ApiProperty({ example: 'Черкаси' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: OutrageRegion.CHERKASY })
  @IsString()
  @IsNotEmpty()
  key: OutrageRegion;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: ['1', '2', '4'] })
  @IsArray()
  @IsNotEmpty()
  queues: string[];

  @ApiProperty({ example: 'https://www.cherkasyoblenergo.com/static/perelik-gpv' })
  @IsString()
  @IsNotEmpty()
  findQueueUrl: string;
}
