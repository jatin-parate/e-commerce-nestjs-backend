import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @Transform(({ value }) => (value as string).trim())
  name: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  password: string;
}
