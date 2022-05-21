import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IUser } from 'src/users/types/user.interface';

export class CreateUserDto
  implements Pick<IUser, 'email' | 'name' | 'password'>
{
  @ApiProperty({ format: 'email', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @Transform(({ value }) => (value as string).trim())
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  password: string;
}
