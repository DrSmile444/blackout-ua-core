import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { OutrageRegionAndQueuesDto, UpdateUserDto, UserDto } from '../dto';
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

  async createUser(userDto: UserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { deviceId: userDto.deviceId } });
    if (existingUser) {
      return this.updateUser(existingUser.id, userDto as UpdateUserDto);
    }

    const { locations, ...userDetails } = userDto;
    const user = this.userRepository.create(userDetails);
    if (locations) {
      user.locations = locations.map((location) => this.locationRepository.create(location));
    }
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['locations'] });
  }

  async findByLocation(region: string, queue: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.locations', 'location')
      .where('location.region = :region', { region })
      .where('location.queue = :queue', { queue })
      .getMany();
  }

  async updateUser(deviceId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { deviceId }, relations: ['locations'] });
    if (!user) {
      throw new NotFoundException(`User with deviceId ${deviceId} not found`);
    }
    const { locations, ...userDetails } = updateUserDto;
    if (locations) {
      user.locations = locations.map((location) => this.locationRepository.create(location));
    }
    Object.assign(user, userDetails);
    console.log(user);
    return await this.userRepository.save(user);
  } // Add more methods as needed, e.g., findOne, update, delete

  async getUsersByRegionQueues(payload: OutrageRegionAndQueuesDto[]): Promise<User[]> {
    const users: User[] = [];
    for (const { region, queues } of payload) {
      const usersByRegionAndQueue = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.locations', 'location')
        .where('location.region = :region', { region })
        .andWhere('location.active = true')
        .andWhere('location.queue IN (:...queues)', { queues })
        .getMany();
      users.push(...usersByRegionAndQueue);
    }
    return users;
  }

  async getUsersByRegionQueuesLead(payload: OutrageRegionAndQueuesDto[], leadTime: NotificationLeadTime): Promise<User[]> {
    const users: User[] = [];
    for (const { region, queues } of payload) {
      const usersByRegionAndQueue = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.locations', 'location')
        .where('location.region = :region', { region })
        .andWhere('location.active = true')
        .andWhere('location.notificationLeadTime = :leadTime', { leadTime })
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
