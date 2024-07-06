import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { OutrageRegion } from './outrage.entity';
import { User } from './user.entity';

@Entity()
export class BlackoutLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: OutrageRegion,
  })
  region: OutrageRegion;

  @Column()
  queues: string;

  @ManyToOne(() => User, (user) => user.locations)
  user: User;
}
