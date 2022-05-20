import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';

class LineItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  productId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ValidateNested()
  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({ type: LineItemDto, isArray: true })
  lineItems: LineItemDto[];
}
