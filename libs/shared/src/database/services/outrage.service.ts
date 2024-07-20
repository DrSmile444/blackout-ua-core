import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as deepEqual from 'fast-deep-equal';
import { Repository } from 'typeorm';

import type { OutrageDto } from '../dto';
import type { OutrageRegion, OutrageShift } from '../entities';
import { Outrage } from '../entities';

function removeIds<T extends object | any[]>(entity: T): T {
  if (Array.isArray(entity)) {
    return entity.map((internalEntity: T) => removeIds(internalEntity)) as unknown as T;
  }

  // Add rule to check if it's not a date
  if (typeof entity === 'object' && entity !== null && !(entity instanceof Date)) {
    const newEntity = { ...entity };
    delete newEntity['id'];
    Object.keys(newEntity).forEach((key) => {
      newEntity[key] = removeIds(newEntity[key] as T);
    });
    return newEntity;
  }
  return entity;
}

@Injectable()
export class OutrageService {
  constructor(
    @InjectRepository(Outrage)
    private readonly outrageRepository: Repository<Outrage>,
  ) {}

  async saveOutrage(outrageDto: OutrageDto): Promise<Outrage> {
    const { createdOutrage, existingOutrages } = await this.getSaveExtras(outrageDto);

    if (createdOutrage) {
      console.info('Skipping outrage creation, already exists');
      return createdOutrage;
    }

    const newOutrage = this.outrageRepository.create(outrageDto);
    newOutrage.changeCount = existingOutrages.length;

    return await this.outrageRepository.save(newOutrage);
  }

  async bulkSaveOutrages(outrages: OutrageDto[]): Promise<Outrage[]> {
    const newOutrages: Outrage[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const outrageDto of outrages) {
      // eslint-disable-next-line no-await-in-loop
      const { createdOutrage, existingOutrages } = await this.getSaveExtras(outrageDto);

      outrageDto.changeCount = existingOutrages.length;

      if (!createdOutrage) {
        const newOutrage = this.outrageRepository.create(outrageDto);
        // eslint-disable-next-line no-await-in-loop
        const savedOutrage = await this.outrageRepository.save(newOutrage);
        newOutrages.push(savedOutrage);
      }
    }

    return newOutrages;
  }

  async getSaveExtras(outrageDto: OutrageDto) {
    const existingOutrages = await this.findOutragesByDateAndRegion(outrageDto.date, outrageDto.region);
    const createdOutrage = existingOutrages.find((existingOutrage) => this.compareOutrages(existingOutrage, outrageDto));

    if (createdOutrage) {
      return { createdOutrage, existingOutrages };
    }
    return { createdOutrage: null, existingOutrages };
  }

  compareOutrages(existingOutrage: Outrage, newOutrage: OutrageDto): boolean {
    const extras: Partial<OutrageDto> = {
      // We don't need to compare the change count
      changeCount: 0,
    };
    const clearExistingOutrage: OutrageDto = { ...(removeIds(existingOutrage) as OutrageDto), ...extras };
    const clearNewOutrage: OutrageDto = { ...newOutrage, ...extras };

    return deepEqual(clearExistingOutrage, clearNewOutrage);
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

  getShiftsForDate(date: Date): Promise<OutrageShift[]> {
    const clearDate = new Date(date.setHours(0, 0, 0, 0));
    return this.outrageRepository
      .createQueryBuilder('outrage')
      .leftJoinAndSelect('outrage.shifts', 'shift')
      .where('outrage.date = :date', { date: clearDate })
      .getMany()
      .then((outrages) => outrages.flatMap((outrage) => outrage.shifts));
  }

  async getShiftAndQueuesForDateAndShiftStart(date: Date, shiftStart: string): Promise<Outrage[]> {
    const clearDate = new Date(date.setHours(0, 0, 0, 0));
    const outrages = await this.outrageRepository
      .createQueryBuilder('outrage')
      .leftJoinAndSelect('outrage.shifts', 'shift')
      .leftJoinAndSelect('shift.queues', 'queue')
      .where('outrage.date = :date', { date: clearDate })
      .andWhere('shift.start = :shiftStart', { shiftStart })
      .getMany();

    return this.getLatestOutrages(outrages);
  }

  async getShiftAndQueuesForDateAndShiftEnd(date: Date, shiftEnd: string): Promise<Outrage[]> {
    const clearDate = new Date(date.setHours(0, 0, 0, 0));
    const outrages = await this.outrageRepository
      .createQueryBuilder('outrage')
      .leftJoinAndSelect('outrage.shifts', 'shift')
      .leftJoinAndSelect('shift.queues', 'queue')
      .where('outrage.date = :date', { date: clearDate })
      .andWhere('shift.end = :shiftEnd', { shiftEnd })
      .getMany();

    return this.getLatestOutrages(outrages);
  }

  getAllLatestOutrages(date: Date): Promise<Outrage[]> {
    const clearDate = new Date(date.setHours(0, 0, 0, 0));
    return this.outrageRepository
      .createQueryBuilder('outrage')
      .leftJoinAndSelect('outrage.shifts', 'shift')
      .leftJoinAndSelect('shift.queues', 'queue')
      .where('outrage.date = :date', { date: clearDate })
      .getMany();
  }

  getLatestOutrages(outrages: Outrage[]): Outrage[] {
    const latestOutragesByRegion: { [region: string]: Outrage } = {};

    outrages.forEach((outrage) => {
      const { region } = outrage;
      if (!latestOutragesByRegion[region] || latestOutragesByRegion[region].changeCount < outrage.changeCount) {
        latestOutragesByRegion[region] = outrage;
      }
    });

    return Object.values(latestOutragesByRegion);
  }

  async deleteAllByDate(date: Date): Promise<void> {
    const clearDate = new Date(date.setHours(0, 0, 0, 0));
    const outrages = await this.outrageRepository
      .createQueryBuilder('outrage')
      .where('outrage.date = :date', { date: clearDate })
      .getMany();

    await this.outrageRepository.remove(outrages);
  }
}
