import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

// eslint-disable-next-line import/no-cycle
import { UserLocation } from './user-location.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ default: true })
  isPushEnabled: boolean;

  @Column({ default: true })
  isPushNextDayEnabled: boolean;

  @Column({ default: true })
  isPushUpdateOutrageEnabled: boolean;

  @OneToMany(() => UserLocation, (location) => location.user, { cascade: ['insert', 'update', 'remove'], onDelete: 'CASCADE' })
  locations: UserLocation[];
}
