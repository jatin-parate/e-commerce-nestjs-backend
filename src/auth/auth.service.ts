import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as utils from 'util';

import { User } from '../users/entities/user';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dtos/create-user.dto';

const pbkdf2 = utils.promisify(crypto.pbkdf2);

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string) {
    const hashedPassword = await pbkdf2(
      password,
      this.configService.get<string>('APP_SECRET'),
      100000,
      64,
      'sha512',
    );
    return hashedPassword.toString('hex');
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      return null;
    }

    const hashedPassword = await this.hashPassword(password);

    if (user.password === hashedPassword) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, id: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: CreateUserDto): Promise<User> {
    const existingUser = await this.usersService.findOne(user.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    user.password = await this.hashPassword(user.password);
    return this.usersService.create(user);
  }
}
