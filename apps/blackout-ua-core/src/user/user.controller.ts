import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { User } from '@app/shared';
import { OutrageRegion, UpdateUserDto, UserDto, UserService } from '@app/shared';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: UserDto })
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description: 'Create a new user',
  })
  async create(@Body() userDto: UserDto): Promise<User> {
    return await this.userService.createUser(userDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'region',
    enum: OutrageRegion,
    description: 'Region key to filter outrages by',
    required: true,
  })
  @ApiQuery({
    name: 'queue',
    example: '4',
    required: false,
  })
  @ApiResponse({
    status: 200,
    type: [UserDto],
    description: 'Get all users',
  })
  async findAll(@Query('region') region: string, @Query('queue') queue: string): Promise<User[]> {
    if (region && queue) {
      return await this.userService.findByLocation(region, queue);
    }

    return await this.userService.findAll();
  }

  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description: 'Updated user',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.updateUser(id, updateUserDto);
  }
}