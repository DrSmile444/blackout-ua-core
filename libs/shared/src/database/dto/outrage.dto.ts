import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { dateTransform } from '../../transformers';
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
  @ApiProperty({ type: Date, example: new Date(new Date().setHours(10, 0, 0, 0)) })
  @Transform(dateTransform)
  @Type(() => Date)
  @IsDate()
  start: Date;

  @ApiProperty({ type: Date, example: new Date(new Date().setHours(11, 0, 0, 0)) })
  @Transform(dateTransform)
  @Type(() => Date)
  @IsDate()
  end: Date;

  @ApiProperty({ type: OutrageQueueDto, example: queueExample, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutrageQueueDto)
  queues: OutrageQueueDto[];
}

export const outrageShiftDtoExample: OutrageShiftDto = {
  start: new Date(new Date().setHours(10, 0, 0, 0)),
  end: new Date(new Date().setHours(11, 0, 0, 0)),
  queues: queueExample,
};

export class OutrageDto {
  @ApiProperty(outrageTypeApiOptions)
  @IsEnum(OutrageType)
  type: OutrageType;

  @ApiProperty({ type: Date, example: new Date(2024, 5, 25) })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty(outrageRegionApiOptions)
  @IsEnum(OutrageRegion)
  region: OutrageRegion;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  changeCount?: number;

  @ApiProperty({
    type: OutrageShiftDto,
    example: outrageShiftDtoExample,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutrageShiftDto)
  shifts: OutrageShiftDto[];
}

export class OutrageSearchResponseDto {
  @ApiProperty({ example: new Date() })
  @Type(() => Date)
  @IsDateString()
  @IsNotEmpty()
  lastUpdate: Date;

  @ApiProperty({ example: new Date() })
  @Type(() => Date)
  @IsDateString()
  @IsNotEmpty()
  accessDate: Date;

  @ApiProperty({ type: OutrageDto, isArray: true })
  @Type(() => OutrageDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  outrages: OutrageDto[];
}

export class OutrageRegionAndQueuesDto {
  @ApiProperty(outrageRegionApiOptions)
  @IsEnum(OutrageRegion)
  region: OutrageRegion;

  @ApiProperty({ type: String, example: ['2', '3'], isArray: true })
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
