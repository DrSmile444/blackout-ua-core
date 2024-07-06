import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BlackoutLocation } from './blackout-location.entity';

@Entity()
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
