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

export class UpdateProductDto
  implements Partial<Omit<IProductData, 'deletedAt'>>
{
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isBestSeller?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  price?: number;

  constructor(partial: Partial<UpdateProductDto>) {
    Object.assign(this, partial);
  }
}

export default class UpdateProductBodyDto {
  @ValidateNested()
  @Type(() => UpdateProductDto)
  @IsNotEmpty()
  @IsNotEmptyObject()
  product: UpdateProductDto;
}
