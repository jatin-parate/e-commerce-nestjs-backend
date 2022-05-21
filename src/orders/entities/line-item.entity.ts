import { Product } from 'src/products/entities/product';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ILineItemWithOrder,
  ILineItemWithProduct,
} from '../interfaces/line-item.interface';
import { Order } from './order.entity';

@Entity()
export class LineItem implements ILineItemWithOrder, ILineItemWithProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order | number;

  @OneToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  product: Product | number;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false })
  unitPrice: number;
}
