import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { OutrageRegion, OutrageType } from './outrage.enums';
// eslint-disable-next-line import/no-cycle
import { OutrageShift } from './outrage-shift.entity';

@Entity('outrages')
export class Outrage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: OutrageType,
  })
  type: OutrageType;

  @Column({
    type: 'enum',
    enum: OutrageRegion,
  })
  region: OutrageRegion;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({ nullable: true })
  changeCount?: number;

  @OneToMany(() => OutrageShift, (shift) => shift.outrage, { cascade: true })
  shifts: OutrageShift[];
}
