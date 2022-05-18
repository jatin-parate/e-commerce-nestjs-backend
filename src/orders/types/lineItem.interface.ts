import { IOrderEntity } from './order.interface';
import { Product } from '../../products/entities/product';

export interface ILineItemEntity {
  id?: number;
  quantity: number;
  product: Product | number;
  order: IOrderEntity;
}
