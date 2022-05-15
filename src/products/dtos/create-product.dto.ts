import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IProductData } from '../interfaces/product.interface';

export class CreateProductDto
  implements Omit<IProductData, 'deletedAt' | 'isBestSeller'>
{
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
  @ApiProperty({ required: false, default: false })
  isActive = false;
}
