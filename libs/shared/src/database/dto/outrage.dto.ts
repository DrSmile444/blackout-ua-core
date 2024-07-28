import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import type { OutrageShift } from '../entities';
import {
  LightStatus,
  lightStatusApiOptions,
  OutrageRegion,
  outrageRegionApiOptions,
  OutrageType,
  outrageTypeApiOptions,
} from '../entities';

export class OutrageQueueDto {
  @ApiProperty({ example: '1' })
  @IsString()
  queue: string;

  @ApiProperty(lightStatusApiOptions)
  @IsEnum(LightStatus)
  lightStatus: LightStatus;
}

const queueExample: OutrageQueueDto[] = [
  {
    queue: '1',
    lightStatus: LightStatus.UNAVAILABLE,
  },
  {
    queue: '2',
    lightStatus: LightStatus.UNAVAILABLE,
  },
  {
    queue: '4',
    lightStatus: LightStatus.POSSIBLY_UNAVAILABLE,
  },
];

export class OutrageShiftDto {
  @ApiProperty({ example: '10:00' })
  @IsString()
  start: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  end: string;

  @ApiProperty({ type: [OutrageQueueDto], example: queueExample })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutrageQueueDto)
  queues: OutrageQueueDto[];
}

export class OutrageDto {
  @ApiProperty(outrageTypeApiOptions)
  @IsEnum(OutrageType)
  type: OutrageType;

  @ApiProperty({ type: Date, example: new Date(2024, 5, 25) })
  @IsDate()
  date: Date;

  @ApiProperty(outrageRegionApiOptions)
  @IsEnum(OutrageRegion)
  region: OutrageRegion;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  changeCount?: number;

  @ApiProperty({
    type: [OutrageShiftDto],
    example: [{ start: '10:00', end: '11:00', queues: queueExample } as OutrageShift],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutrageShiftDto)
  shifts: OutrageShiftDto[];
}

export class OutrageResponseDto {
  @ApiProperty({ example: new Date() })
  @IsDateString()
  @IsNotEmpty()
  lastUpdate: Date;

  @ApiProperty({ example: new Date() })
  @IsDateString()
  @IsNotEmpty()
  accessDate: Date;

  @ApiProperty({ type: [OutrageDto] })
  @IsNotEmpty()
  outrages: OutrageDto[];
}

export class OutrageRegionAndQueuesDto {
  @ApiProperty(outrageRegionApiOptions)
  @IsEnum(OutrageRegion)
  region: OutrageRegion;

  @ApiProperty({ type: [String], example: ['2', '3'] })
  @IsArray()
  @Type(() => String)
  queues: string[];
}

export const outrageRegionAndQueuesDtoExamples: OutrageRegionAndQueuesDto[] = [
  {
    region: OutrageRegion.CHERKASY,
    queues: ['2', '3'],
  },
  {
    region: OutrageRegion.CHERNIVTSI,
    queues: ['1'],
  },
];
