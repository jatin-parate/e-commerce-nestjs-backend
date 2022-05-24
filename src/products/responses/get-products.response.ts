import { ApiProperty } from '@nestjs/swagger';
import { IProduct } from '../interfaces/product.interface';

export class GetAllProductResponse implements IProduct {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  deletedAt?: Date | undefined;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isBestSeller: boolean;

  constructor(partial?: Partial<GetAllProductResponse>) {
    Object.assign(this, partial);
  }
}
