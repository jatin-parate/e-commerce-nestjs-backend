import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Product } from '../entities/product';

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAllProductsQueryDto {
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => (value as string).trim())
  search?: string;

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value == null ? true : JSON.parse(value as string),
  )
  isActive?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => (value == null ? 10 : parseInt(value as any, 10)))
  limit = 10;

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => (value == null ? 'createdAt' : (value as any)))
  sort: keyof Product = 'createdAt';

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value == null ? SortDirection.DESC : (value as any),
  )
  order: SortDirection = SortDirection.DESC;

  constructor(partial: Partial<GetAllProductsQueryDto>) {
    Object.assign(this, partial);
  }
}
