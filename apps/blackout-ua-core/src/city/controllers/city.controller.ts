import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CityMetadataDto, UkraineBaseService } from '@ukraine/ukraine-base';

@ApiTags('city')
@Controller('city')
export class CityController {
  constructor(private ukraineBaseService: UkraineBaseService) {}

  @Get('/')
  @ApiOperation({ summary: 'Returns a list of all cities and their queues' })
  @ApiResponse({
    status: 200,
    type: [CityMetadataDto],
    description: 'Returns a list of all cities and their metadata',
  })
  async getAllMetadata() {
    return this.ukraineBaseService.getAllMetadata();
  }
}
