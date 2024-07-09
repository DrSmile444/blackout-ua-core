import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

import { NotificationLeadTime, OutrageRegion } from '../entities';

export class UserLocationDto {
  @ApiProperty({ example: 'Мій Дім' })
  name: string;

  @ApiProperty({ example: OutrageRegion.CHERKASY, enum: OutrageRegion })
  region: OutrageRegion;

  @ApiProperty({ example: true, description: 'Is location active to send push notification' })
  active: boolean;

  @ApiProperty({ example: NotificationLeadTime.MIN_15, enum: NotificationLeadTime })
  notificationLeadTime: NotificationLeadTime;

  @ApiProperty({ example: '1' })
  queue: string;
}

export class CreateUserDto {
  @ApiProperty({
    example: '00000000-54b3-e7c7-0000-000046bffd97',
    description: 'Unique device identifier',
  })
  deviceId: string;

  @ApiProperty({
    example:
      'e8UZaAAQFma7-m3Rm2HfGp:APA91bFfR1ZHsJs_cPB9Rf5G0V10Xj4N13XtsnIqTL2OoFyHbRcvH8J93xD9X3ZpBdcnU4Z3sRt6kcmxGqqNgnwvcj_pJ8D0s8h3yI1UUEP0gJdz9xXQgG4SRcoErKglHqB9e56He8lM',
    description: 'Firebase Cloud Messaging token',
  })
  fcmToken: string;
}

export class UserDto {
  // give me example deviceId
  @ApiProperty({
    example: '00000000-54b3-e7c7-0000-000046bffd97',
    description: 'Unique device identifier',
  })
  @IsString()
  deviceId: string;

  @ApiProperty({
    example:
      'e8UZaAAQFma7-m3Rm2HfGp:APA91bFfR1ZHsJs_cPB9Rf5G0V10Xj4N13XtsnIqTL2OoFyHbRcvH8J93xD9X3ZpBdcnU4Z3sRt6kcmxGqqNgnwvcj_pJ8D0s8h3yI1UUEP0gJdz9xXQgG4SRcoErKglHqB9e56He8lM',
    description: 'Firebase Cloud Messaging token',
  })
  @IsString()
  fcmToken: string;

  @ApiProperty({
    type: [UserLocationDto],
    example: [
      {
        name: 'Мій Дім',
        region: OutrageRegion.CHERKASY,
        active: true,
        notificationLeadTime: NotificationLeadTime.MIN_15,
        queue: '1',
      },
      {
        name: 'Спортзал',
        region: OutrageRegion.CHERKASY,
        active: true,
        notificationLeadTime: NotificationLeadTime.MIN_30,
        queue: '6',
      },
      {
        name: 'Офіс Чернівці',
        region: OutrageRegion.CHERNIVTSI,
        active: false,
        notificationLeadTime: NotificationLeadTime.MIN_60,
        queue: '6',
      },
    ] as UserLocationDto[],
  })
  @IsArray()
  locations: UserLocationDto[];
}

export class UpdateUserDto extends PartialType(UserDto) {}
