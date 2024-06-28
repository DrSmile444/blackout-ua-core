import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OutrageType, OutrageShift } from '../entities/outrage.entity';
import { ApiProperty } from '@nestjs/swagger';
import { outrageMock1Origin } from '../mocks/outrage.mock';

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
  @ApiProperty({ example: outrageMock1Origin })
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

  // we need to add optional changeCount
  @ApiProperty({ example: 0 })
  @IsOptional()
  changeCount?: number;

  @ApiProperty({
    type: [CreateOutrageShiftDto],
    example: [
      { start: '10:00', end: '11:00', queues: [1, 2, 4] } as OutrageShift,
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOutrageShiftDto)
  shifts: OutrageShift[];
}
