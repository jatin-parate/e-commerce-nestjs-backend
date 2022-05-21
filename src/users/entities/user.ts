import { Exclude } from 'class-transformer';
import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IUserWithOrders } from '../types/user.interface';

export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity()
export class User implements IUserWithOrders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  @Index()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ enum: Roles, default: Roles.USER })
  role: Roles;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders?: Order[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
