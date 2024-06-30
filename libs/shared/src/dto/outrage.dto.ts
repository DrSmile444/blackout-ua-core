import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import type { OutrageShift } from '@app/shared';

import { OutrageRegion, OutrageType } from '../entities';
import { outrageMock5Change2 } from '../mocks';

export class CreateOutrageShiftDto {
  @ApiProperty({ example: '10:00' })
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  @IsNotEmpty()
  end: string;

  @ApiProperty({ example: [1, 2, 4] })
  @IsArray()
  @IsNotEmpty()
  queues: number[];
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
    type: [CreateOutrageShiftDto],
    example: [{ start: '10:00', end: '11:00', queues: ['1', '2', '4'] } as OutrageShift],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOutrageShiftDto)
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
