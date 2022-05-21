import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProductImageDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({ example: 'https://www.google.com', required: false })
  imageUrl?: string;

  @ApiProperty({ required: false, type: 'file' })
  image?: Express.Multer.File;
}
