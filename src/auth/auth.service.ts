import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(email);

    if (user && user.password === password) {
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

    return this.usersService.create(user);
  }
}
