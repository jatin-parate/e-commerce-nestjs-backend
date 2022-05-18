import { User } from '../../users/entities/user';
import { LineItemEntity } from '../entities/lineItem.entity';

export interface IOrderEntity {
  id?: number;
  user: User;
  lineItems: LineItemEntity[];
}
