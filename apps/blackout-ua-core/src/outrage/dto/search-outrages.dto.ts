import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';

import { dateTransform, OutrageRegionAndQueuesDto, outrageRegionAndQueuesDtoExamples } from '@app/shared';

export class SearchOutragesDto {
  @ApiProperty({ type: [OutrageRegionAndQueuesDto], example: outrageRegionAndQueuesDtoExamples })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => OutrageRegionAndQueuesDto)
  regions: OutrageRegionAndQueuesDto[];

  @ApiProperty({ description: 'Date which we use for search', example: new Date(new Date().setHours(0, 0, 0, 0)).toISOString() })
  @Transform(dateTransform, { toClassOnly: true })
  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  final?: boolean;
}
