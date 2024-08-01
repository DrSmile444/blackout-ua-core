import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { NotificationLeadTime, OutrageRegion } from './outrage.enums';
// eslint-disable-next-line import/no-cycle
import { User } from './user.entity';

@Entity('user_locations')
export class UserLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: OutrageRegion,
  })
  region: OutrageRegion;

  @Column({ default: true })
  isPushUpdateOutrageEnabled: boolean;

  @Column()
  queue: string;

  @Column({
    type: 'int',
    default: [15],
    enum: NotificationLeadTime,
    array: true,
  })
  notificationLeadTime: number[];

  @ManyToOne(() => User, (user) => user.locations, { onDelete: 'CASCADE' })
  user: User;
}
