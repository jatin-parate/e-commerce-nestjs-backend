import { User } from 'src/users/entities/user';

export interface IOrder {
  id: number;
}

export interface IOrderWithUser extends IOrder {
  user: User;
}
