import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetAllOrdersOptions {
  @ApiProperty({
    title: 'limit',
    type: Number,
    format: 'int32',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit = 10;

  @ApiProperty({
    title: 'page',
    type: Number,
    format: 'int32',
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page = 1;
}
