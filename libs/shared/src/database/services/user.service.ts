import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { UpdateUserDto, UserDto } from '../../dto';
import { BlackoutLocation, User } from '../../entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BlackoutLocation)
    private readonly locationRepository: Repository<BlackoutLocation>,
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

  async findByLocation(locationName: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.locations', 'location')
      .where('location.name = :locationName', { locationName })
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
    return await this.userRepository.save(user);
  } // Add more methods as needed, e.g., findOne, update, delete
}
