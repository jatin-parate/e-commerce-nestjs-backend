import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name!: string;

  @Column()
  price!: number;

  @Column()
  description: string;

  @Column()
  quantity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isBestSeller!: boolean;
}
