import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';

import type { User, UserLocation } from '../entities';
import { NotificationLeadTime, notificationLeadTimeApiOptions, OutrageRegion, outrageRegionApiOptions } from '../entities';

export class UserLocationDto implements Omit<UserLocation, 'id' | 'user'> {
  @ApiProperty({ example: 'Мій Дім' })
  @IsString()
  name: string;

  @ApiProperty(outrageRegionApiOptions)
  @IsEnum(OutrageRegion)
  region: OutrageRegion;

  @ApiProperty({ example: true, description: 'Is push notification for outrage update enabled' })
  @IsBoolean()
  isPushUpdateOutrageEnabled: boolean;

  @ApiProperty({ ...notificationLeadTimeApiOptions, example: [NotificationLeadTime.MIN_15] })
  @IsArray()
  @IsEnum(NotificationLeadTime, { each: true })
  notificationLeadTime: NotificationLeadTime[];

  @ApiProperty({ example: '1' })
  @IsString()
  queue: string;
}

export const userLocationDtoExamples: UserLocationDto[] = [
  {
    name: 'Мій Дім',
    region: OutrageRegion.CHERKASY,
    isPushUpdateOutrageEnabled: true,
    notificationLeadTime: [NotificationLeadTime.MIN_15],
    queue: '1',
  },
  {
    name: 'Спортзал',
    region: OutrageRegion.CHERKASY,
    isPushUpdateOutrageEnabled: true,
    notificationLeadTime: [NotificationLeadTime.MIN_15, NotificationLeadTime.MIN_30],
    queue: '6',
  },
  {
    name: 'Офіс Чернівці',
    region: OutrageRegion.CHERNIVTSI,
    isPushUpdateOutrageEnabled: false,
    notificationLeadTime: [NotificationLeadTime.MIN_60],
    queue: '6',
  },
];

export class CreateUserDto {
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
}

export class UserDto extends CreateUserDto implements Omit<User, 'locations'> {
  @ApiProperty({
    example: '00000000-54b3-e7c7-0000-000046bffd97',
    description: 'Unique user identifier',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: true,
    description: 'Is all push notification enabled',
  })
  @IsBoolean()
  isPushEnabled: boolean;

  @ApiProperty({
    example: true,
    description: 'Is push notification for next day enabled',
  })
  @IsBoolean()
  isPushNextDayEnabled: boolean;

  @ApiProperty({
    example: true,
    description: 'Is push notification for outrage update enabled',
  })
  @IsBoolean()
  isPushUpdateOutrageEnabled: boolean;

  @ApiProperty({
    type: [UserLocationDto],
    example: userLocationDtoExamples,
    isArray: true,
  })
  @IsArray()
  @Type(() => UserLocationDto)
  @ValidateNested({ each: true })
  locations: UserLocationDto[];
}

export class UpdateUserDto extends PartialType(UserDto) {}
