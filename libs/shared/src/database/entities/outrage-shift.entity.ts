// outrage-shift.entity.ts
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

// eslint-disable-next-line import/no-cycle
import { Outrage } from './outrage.entity';
// eslint-disable-next-line import/no-cycle
import { OutrageQueue } from './outrage-queue.entity';

@Entity('outrage_shifts')
export class OutrageShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  start: string;

  @Column()
  end: string;

  @ManyToOne(() => Outrage, (outrage) => outrage.shifts)
  outrage: Outrage;

  @OneToMany(() => OutrageQueue, (queue) => queue.shift, { cascade: true })
  queues: OutrageQueue[];
}
