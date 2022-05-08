import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { User } from '../users/entities/user';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  async login(@Request() req: ExpressRequest) {
    return await this.authService.login(req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@Request() req: ExpressRequest): Promise<User> {
    return req.user as User;
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.register(createUserDto);
  }
}
