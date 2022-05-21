import { Product } from 'src/products/entities/product';
import {
  Column,
  Entity,
  Index,
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
  @Index()
  order: Order | number;

  @OneToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  @Index()
  product: Product | number;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false })
  unitPrice: number;
}
