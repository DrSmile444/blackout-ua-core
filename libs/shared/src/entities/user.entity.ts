import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

// eslint-disable-next-line import/no-cycle
import { BlackoutLocation } from './blackout-location.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  fcmToken: string;

  @OneToMany(() => BlackoutLocation, (location) => location.user, { cascade: true })
  locations: BlackoutLocation[];
}
