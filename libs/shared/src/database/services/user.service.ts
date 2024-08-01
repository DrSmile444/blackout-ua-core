import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { DeleteResult } from 'typeorm';
import { Repository } from 'typeorm';

import type { CreateUserDto, OutrageRegionAndQueuesDto, UpdateUserDto } from '../dto';
import type { NotificationLeadTime } from '../entities';
import { User, UserLocation } from '../entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLocation)
    private readonly locationRepository: Repository<UserLocation>,
  ) {}

  async createUser(userDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { deviceId: userDto.deviceId } });
    if (existingUser) {
      return this.updateUser(existingUser.id, userDto as UpdateUserDto);
    }

    const user = this.userRepository.create(userDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['locations'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['locations'] });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByLocation(region: string, queue: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.locations', 'location')
      .where('location.region = :region', { region })
      .where('location.queue = :queue', { queue })
      .getMany();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['locations'] });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { locations, ...userDetails } = updateUserDto;
    if (locations) {
      user.locations = locations.map((location) => this.locationRepository.create(location));
    }
    Object.assign(user, userDetails);
    return await this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<DeleteResult> {
    return await this.userRepository.delete(id);
  }

  async getUsersByRegionQueues(payload: OutrageRegionAndQueuesDto[]): Promise<User[]> {
    const users: User[] = [];
    // TODO find a way to optimize this
    // eslint-disable-next-line no-restricted-syntax
    for (const { region, queues } of payload) {
      // eslint-disable-next-line no-await-in-loop
      const usersByRegionAndQueue = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.locations', 'location')
        .where('location.region = :region', { region })
        .andWhere('user.isPushEnabled = true')
        .andWhere('location.queue IN (:...queues)', { queues })
        .andWhere('array_length(location.notificationLeadTime, 1) > 0')
        .getMany();
      users.push(...usersByRegionAndQueue);
    }
    return users;
  }

  async getUsersByRegionQueuesWithChange(payload: OutrageRegionAndQueuesDto[]): Promise<User[]> {
    const users: User[] = [];
    // TODO find a way to optimize this
    // eslint-disable-next-line no-restricted-syntax
    for (const { region, queues } of payload) {
      // eslint-disable-next-line no-await-in-loop
      const usersByRegionAndQueue = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.locations', 'location')
        .where('location.region = :region', { region })
        .andWhere('user.isPushEnabled = true')
        .andWhere('user.isPushUpdateOutrageEnabled = true')
        .andWhere('location.queue IN (:...queues)', { queues })
        .andWhere('array_length(location.notificationLeadTime, 1) > 0')
        .getMany();
      users.push(...usersByRegionAndQueue);
    }
    return users;
  }

  async getUsersByRegionQueuesLead(payload: OutrageRegionAndQueuesDto[], leadTime: NotificationLeadTime): Promise<User[]> {
    const users: User[] = [];
    // TODO find a way to optimize this
    // eslint-disable-next-line no-restricted-syntax
    for (const { region, queues } of payload) {
      // eslint-disable-next-line no-await-in-loop
      const usersByRegionAndQueue = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.locations', 'location')
        .where('location.region = :region', { region })
        .andWhere('user.isPushEnabled = true')
        .andWhere(':leadTime = ANY(location.notificationLeadTime)', { leadTime })
        .andWhere('location.queue IN (:...queues)', { queues })
        .getMany();
      users.push(...usersByRegionAndQueue);
    }
    return users;
  }

  async deleteAll(): Promise<void> {
    await this.locationRepository.delete({});
    await this.userRepository.delete({});
  }
}
