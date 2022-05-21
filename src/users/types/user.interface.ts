import { Order } from 'src/orders/entities/order.entity';
import { Roles } from '../entities/user';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Roles;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithOrders extends IUser {
  orders?: Order[];
}
