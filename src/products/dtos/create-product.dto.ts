import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  price: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  quantity: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  isActive: boolean;
}
