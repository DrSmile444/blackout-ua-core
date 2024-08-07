import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';

import { dateTransform, getClearDateIsoString, OutrageRegionAndQueuesDto, outrageRegionAndQueuesDtoExamples } from '@app/shared';

export class SearchOutragesDto {
  @ApiProperty({ type: OutrageRegionAndQueuesDto, example: outrageRegionAndQueuesDtoExamples, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => OutrageRegionAndQueuesDto)
  regions: OutrageRegionAndQueuesDto[];

  @ApiPropertyOptional({ description: 'Date which we use for search', example: getClearDateIsoString(new Date()) })
  @Transform(dateTransform, { toClassOnly: true })
  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  final?: boolean;
}
