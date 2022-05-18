import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class LineItemDto {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  productId: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  quantity: number;
}

export class CreateOrderDto {
  @ValidateNested({ each: true })
  @ApiProperty({ type: LineItemDto, isArray: true })
  lineItems: LineItemDto[];
}
