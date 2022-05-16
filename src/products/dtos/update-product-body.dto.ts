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
import { ProductImage } from '../../product-images/entities/product-image.entity';

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

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  quantity?: number;

  image?: ProductImage;

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
