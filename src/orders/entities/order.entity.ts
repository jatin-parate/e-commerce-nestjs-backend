import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IOrderEntity } from '../types/order.interface';
import { LineItemEntity } from './lineItem.entity';
import { User } from '../../users/entities/user';

@Entity()
export class OrderEntity implements IOrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => LineItemEntity, (lineItem) => lineItem.order, {
    nullable: false,
    cascade: true,
  })
  lineItems!: LineItemEntity[];

  @OneToOne(() => User, { nullable: false, cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
