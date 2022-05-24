import { IProductData } from '../interfaces/product.interface';
import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto
  implements Partial<Omit<IProductData, 'deletedAt'>>
{
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isActive?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isBestSeller?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  price?: number;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  quantityUpdate?: number;

  constructor(partial: Partial<UpdateProductDto>) {
    Object.assign(this, partial);
  }
}

export default class UpdateProductBodyDto {
  @ValidateNested()
  @Type(() => UpdateProductDto)
  @IsNotEmpty()
  @IsNotEmptyObject()
  @ApiProperty({ type: UpdateProductDto })
  product: UpdateProductDto;
}
