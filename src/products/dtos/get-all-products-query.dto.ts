import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

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

  constructor(partial: Partial<GetAllProductsQueryDto>) {
    Object.assign(this, partial);
  }
}
