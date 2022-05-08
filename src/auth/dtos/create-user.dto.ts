import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
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
