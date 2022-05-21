import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum AllowedProductSorts {
  id = 'id',
  name = 'name',
  price = 'price',
  description = 'description',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  isBestSeller = 'isBestSeller',
}

export class GetAllProductsQueryDto {
  @ApiProperty({
    title: 'search',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => (value as string).trim())
  search?: string;

  @ApiProperty({
    title: 'isActive',
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value == null ? true : JSON.parse(value as string),
  )
  isActive?: boolean;

  @ApiProperty({
    title: 'limit',
    type: 'int32',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => (value == null ? 10 : parseInt(value as any, 10)))
  limit = 10;

  @ApiProperty({
    title: 'sort',
    type: 'string',
    enum: AllowedProductSorts,
    default: AllowedProductSorts.updatedAt,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(AllowedProductSorts)
  sort: AllowedProductSorts = AllowedProductSorts.updatedAt;

  @ApiProperty({
    title: 'order',
    enum: SortDirection,
    required: false,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsNotEmpty()
  order: SortDirection = SortDirection.DESC;

  constructor(partial: Partial<GetAllProductsQueryDto>) {
    Object.assign(this, partial);
  }
}
