import { User } from 'src/users/entities/user';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LineItem } from './line-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => LineItem, (lineItem) => lineItem.order, {
    nullable: false,
    onDelete: 'CASCADE',
    cascade: true,
  })
  lineItems: LineItem[];
}
