import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { IProductImageData } from '../types/product-image.interface';

export class CreateProductImageDto implements IProductImageData {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @ApiProperty({ example: 'https://www.google.com' })
  imageUrl: string;
}
