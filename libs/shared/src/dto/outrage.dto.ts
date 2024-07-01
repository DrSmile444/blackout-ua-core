import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import type { OutrageQueue, OutrageShift } from '../entities';
import { LightStatus, OutrageRegion, OutrageType } from '../entities';
import { outrageMock5Change2 } from '../mocks';

const lightStatusAllValues = Object.values(LightStatus);
const lightStatusKeys = lightStatusAllValues.slice(0, lightStatusAllValues.length / 2);
const lightStatusValues = lightStatusAllValues.slice(lightStatusAllValues.length / 2);

const lightStatusDescription = `
export enum LightStatus {
${lightStatusKeys.map((key, index) => `  ${key} = ${lightStatusValues[index]},`).join('\n')}
}
`;

export class OutrageQueueDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  queue: string;

  @ApiProperty({
    enum: LightStatus,
    example: LightStatus.AVAILABLE,
    description: lightStatusDescription,
  })
  @IsEnum(LightStatus)
  @IsNotEmpty()
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
  @IsNotEmpty()
  start: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  @IsNotEmpty()
  end: string;

  @ApiProperty({ type: [OutrageQueueDto], example: queueExample })
  @Type(() => OutrageQueueDto)
  @IsArray()
  @IsNotEmpty()
  queues: OutrageQueue[];
}

export class OutrageMessageDto {
  @ApiProperty({ enum: OutrageRegion, example: OutrageRegion.CHERKASY })
  region: OutrageRegion;

  @ApiProperty({ example: outrageMock5Change2 })
  message: string;
}

export class OutrageDto {
  @ApiProperty({ enum: OutrageType, example: OutrageType.SCHEDULE })
  @IsEnum(OutrageType)
  type: OutrageType;

  @ApiProperty({ type: Date, example: new Date(2024, 5, 25) })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ enum: OutrageRegion, example: OutrageRegion.CHERKASY })
  @IsEnum(OutrageRegion)
  @IsNotEmpty()
  region: OutrageRegion;

  // we need to add optional changeCount
  @ApiProperty({ example: 0 })
  @IsOptional()
  changeCount?: number;

  @ApiProperty({
    type: [OutrageShiftDto],
    example: [{ start: '10:00', end: '11:00', queues: queueExample } as OutrageShift],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OutrageShiftDto)
  shifts: OutrageShift[];
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
