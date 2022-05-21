import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { User } from './entities/user';
import { IUser } from './types/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private static generateUserKey(user: Pick<User, 'email'>): string {
    return `user:${user.email}`;
  }

  async findOne(email: string): Promise<Optional<User>> {
    return await this.getUserFromCacheOrDb(email, async () => {
      return await this.userRepository.findOne({ email });
    });
  }

  private async getUserFromCacheOrDb(
    email: User['email'],
    findOne: () => Promise<Optional<User>>,
  ): Promise<Optional<User>> {
    const userInCache = await this.cacheManager.get<IUser | undefined>(
      UsersService.generateUserKey({ email }),
    );

    if (userInCache) {
      return new User(userInCache);
    }

    const userInDb = await findOne();
    if (!userInDb) {
      return;
    }

    this.saveUserInCache(userInDb);
    return userInDb;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private saveUserInCache({ orders, ...userData }: User) {
    this.cacheManager.set(UsersService.generateUserKey(userData), userData, {
      ttl: 43200,
    });
  }

  async create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role'>,
  ): Promise<User> {
    let newUser = this.userRepository.create(user);
    newUser = await this.userRepository.save(newUser);

    this.saveUserInCache(newUser);

    return newUser;
  }
}
