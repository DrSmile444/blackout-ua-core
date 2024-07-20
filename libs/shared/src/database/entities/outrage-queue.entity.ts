// outrage-queue.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { LightStatus } from './outrage.enums';
// eslint-disable-next-line import/no-cycle
import { OutrageShift } from './outrage-shift.entity';

@Entity('outrage_queues')
export class OutrageQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  queue: string;

  @Column({
    type: 'enum',
    enum: LightStatus,
  })
  lightStatus: LightStatus;

  @ManyToOne(() => OutrageShift, (shift) => shift.queues, { onDelete: 'CASCADE' })
  shift: OutrageShift;
}
