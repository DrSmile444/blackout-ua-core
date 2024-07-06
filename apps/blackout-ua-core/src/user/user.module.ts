import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/shared';

import { UserController } from './user.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
})
export class UserModule {}
