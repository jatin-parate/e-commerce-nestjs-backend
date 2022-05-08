import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findOne(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role'>,
  ): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }
}
