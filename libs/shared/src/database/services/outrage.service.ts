import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { OutrageDto } from '../dto';
import type { OutrageRegion } from '../entities';
import { Outrage } from '../entities';

@Injectable()
export class OutrageService {
  constructor(
    @InjectRepository(Outrage)
    private readonly outrageRepository: Repository<Outrage>,
  ) {}

  async createOutrage(outrageDto: OutrageDto): Promise<Outrage> {
    const outrage = this.outrageRepository.create(outrageDto);
    return await this.outrageRepository.save(outrage);
  }

  async getAll(): Promise<Outrage[]> {
    return await this.outrageRepository.find();
  }

  async findAll(date: Date, region: OutrageRegion): Promise<Outrage[]> {
    return await this.outrageRepository
      .createQueryBuilder('outrage')
      .leftJoinAndSelect('outrage.shifts', 'shift')
      .leftJoinAndSelect('shift.queues', 'queue')
      .where('outrage.date = :date', { date })
      .andWhere('outrage.region = :region', { region })
      .getMany();
  }

  async findOutrages(date: Date, region: OutrageRegion, queues: string[]): Promise<Outrage[]> {
    return await this.outrageRepository
      .createQueryBuilder('outrage')
      .leftJoinAndSelect('outrage.shifts', 'shift')
      .leftJoinAndSelect('shift.queues', 'queue')
      .where('outrage.date = :date', { date })
      .andWhere('outrage.region = :region', { region })
      .andWhere('queue.queue IN (:...queues)', { queues })
      .getMany();
  }
}
