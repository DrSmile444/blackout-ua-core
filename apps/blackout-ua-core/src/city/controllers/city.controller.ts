import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CityMetadataDto, UkraineBaseService } from '@ukraine/ukraine-base';

@ApiTags('city')
@Controller('city')
@UseInterceptors(CacheInterceptor)
export class CityController {
  constructor(private ukraineBaseService: UkraineBaseService) {}

  @Get('/')
  @ApiOperation({ summary: 'Returns a list of all cities and their queues' })
  @ApiResponse({
    status: 200,
    type: [CityMetadataDto],
    description: 'Returns a list of all cities and their metadata',
  })
  getAllMetadata() {
    return this.ukraineBaseService.getAllMetadata();
  }
}
