import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CityMetadataDto {
  @ApiProperty({ example: 'Cherkasy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: ['1', '2', '4'] })
  @IsArray()
  @IsNotEmpty()
  queues: string[];
}
