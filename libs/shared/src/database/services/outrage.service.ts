import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as deepEqual from 'fast-deep-equal';
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

  async saveOutrage(outrageDto: OutrageDto): Promise<Outrage> {
    const existingOutrages = await this.findOutragesByDateAndRegion(outrageDto.date, outrageDto.region);
    const createdOutrage = existingOutrages.find((existingOutrage) =>
      deepEqual({ ...existingOutrage, changeCount: 0 }, { ...outrageDto, changeCount: 0 }),
    );

    if (createdOutrage) {
      console.info('Skipping outrage creation, already exists');
      return createdOutrage;
    }

    const newOutrage = this.outrageRepository.create(outrageDto);
    return await this.outrageRepository.save(newOutrage);
  }

  async bulkSaveOutrages(outrages: OutrageDto[]): Promise<Outrage[]> {
    const newOutrages: Outrage[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const outrageDto of outrages) {
      // eslint-disable-next-line no-await-in-loop
      const existingOutrages = await this.findOutragesByDateAndRegion(outrageDto.date, outrageDto.region);
      const createdOutrage = existingOutrages.find((existingOutrage) =>
        deepEqual({ ...existingOutrage, changeCount: 0, id: '0' } as Outrage, { ...outrageDto, changeCount: 0, id: '0' } as Outrage),
      );

      console.log('existingOutrages', existingOutrages);
      console.log('createdOutrage', createdOutrage);
      console.log('outrageDto', outrageDto);
      outrageDto.changeCount = existingOutrages.length;

      if (!createdOutrage) {
        // eslint-disable-next-line no-await-in-loop
        const savedOutrage = await this.saveOutrage(outrageDto);
        newOutrages.push(savedOutrage);
      }
    }

    return newOutrages;
  }

  async getAll(): Promise<Outrage[]> {
    return await this.outrageRepository.find();
  }

  async findOutragesByDateAndRegion(date: Date, region: OutrageRegion): Promise<Outrage[]> {
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
