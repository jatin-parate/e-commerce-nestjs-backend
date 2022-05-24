import { User } from 'src/users/entities/user';
import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IOrderWithUser } from '../interfaces/order.interface';
import { LineItem } from './line-item.entity';

@Entity()
export class Order implements IOrderWithUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @Index({ unique: false })
  user: User;

  @OneToMany(() => LineItem, (lineItem) => lineItem.order, {
    nullable: false,
    onDelete: 'CASCADE',
    cascade: true,
  })
  lineItems: LineItem[];
}
