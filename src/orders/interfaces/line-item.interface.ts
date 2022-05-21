import { Product } from 'src/products/entities/product';
import { Order } from '../entities/order.entity';

export interface ILineItem {
  id: number;
  quantity: number;
  unitPrice: number;
}

export interface ILineItemWithOrder extends ILineItem {
  order: Order | number;
}

export interface ILineItemWithProduct extends ILineItem {
  product: Product | number;
}
