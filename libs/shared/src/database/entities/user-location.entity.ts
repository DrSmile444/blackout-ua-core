import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { OutrageRegion } from './outrage.enums';
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

  @Column({ default: true, type: 'boolean' })
  active: boolean;

  @Column()
  queue: string;

  @ManyToOne(() => User, (user) => user.locations)
  user: User;
}
