import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AdjustQuantityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  lineItemId: number;

  @ApiProperty({ description: 'Quantity to adjust' })
  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
