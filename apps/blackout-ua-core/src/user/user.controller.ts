import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { CreateUserDto, UserDto } from '@app/shared';

@ApiTags('user')
@Controller('user')
export class UserController {
  @Post('/')
  @ApiBody({ type: CreateUserDto })
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    // TODO add Postgres logic
    return 'User created';
  }

  @Put('/:id')
  @ApiBody({ type: UserDto })
  updateUser(@Param('id') id: string, @Body() updateUserDto: UserDto) {
    console.log(id, updateUserDto);
    // TODO add Postgres logic
    return 'User updated';
  }
}
