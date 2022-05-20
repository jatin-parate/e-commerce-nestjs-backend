import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AdjustQuantityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  lineItemId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
