import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { OutrageRegionAndQueuesDto, UpdateUserDto, UserDto } from '../dto';
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

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['locations'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { locations, ...userDetails } = updateUserDto;
    if (locations) {
      user.locations = locations.map((location) => this.locationRepository.create(location));
    }
    Object.assign(user, userDetails);
    console.log(user);
    return await this.userRepository.save(user);
  } // Add more methods as needed, e.g., findOne, update, delete

  async getUsersByRegionAndQueues(payload: OutrageRegionAndQueuesDto[]): Promise<User[]> {
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
}
