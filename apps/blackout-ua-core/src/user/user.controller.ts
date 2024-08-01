import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';

import type { User } from '@app/shared';
import { CreateUserDto, outrageRegionApiOptions, UpdateUserDto, UserDto, UserService } from '@app/shared';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description: 'Create a new user',
  })
  async create(@Body() userDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(userDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    ...outrageRegionApiOptions,
    name: 'region',
    description: 'Region key to filter outrages by',
    required: false,
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

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description: 'Get user by id',
  })
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: 'Update an existing user by id' })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description: 'Updated user',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing user by id' })
  @ApiResponse({
    status: 200,
    type: DeleteResult,
    description: 'Delete result',
  })
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.userService.deleteUser(id);
  }
}
