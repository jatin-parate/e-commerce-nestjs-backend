import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AdjustQuantityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  lineItemId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
