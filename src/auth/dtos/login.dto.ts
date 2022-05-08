import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ format: 'email', required: true })
  username: string;

  @ApiProperty({ required: true })
  password: string;
}
