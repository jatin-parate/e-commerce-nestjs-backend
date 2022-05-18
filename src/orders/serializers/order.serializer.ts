import { IOrderEntity } from '../types/order.interface';
import { LineItemEntity } from '../entities/lineItem.entity';
import { User } from '../../users/entities/user';

export class OrderSerializer implements Omit<IOrderEntity, 'lineItems'> {
  id: number;
  lineItems: Omit<LineItemEntity, 'order'>[];
  user: User;

  constructor(partial: Partial<OrderSerializer>) {
    Object.assign(this, partial);
    if (partial.lineItems) {
      this.lineItems = partial.lineItems.map(({ id, product, quantity }) => ({
        product,
        quantity,
        id,
      }));
    }
  }
}
