import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ILineItemEntity } from '../types/lineItem.interface';
import { Product } from '../../products/entities/product';
import { OrderEntity } from './order.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class LineItemEntity implements ILineItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Product, {
    primary: true,
    cascade: ['insert'],
    nullable: false,
  })
  @JoinColumn()
  product!: Product | number;

  @ManyToOne(() => OrderEntity, {
    primary: true,
    nullable: false,
  })
  @JoinColumn()
  @Exclude()
  order!: OrderEntity;

  @Column()
  quantity!: number;
}
