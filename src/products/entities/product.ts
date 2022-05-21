import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinTable,
  OneToMany,
  Index,
} from 'typeorm';
import { IProduct } from '../interfaces/product.interface';
import { ProductImage } from '../../product-images/entities/product-image.entity';

@Entity()
export class Product implements IProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  name!: string;

  @Column()
  price!: number;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  @Index()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ default: true })
  @Index()
  isActive!: boolean;

  @Column({ default: false })
  isBestSeller!: boolean;

  @OneToMany(() => ProductImage, (image) => image.product, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  images: ProductImage[];

  constructor(partial?: Partial<Product>) {
    Object.assign(this, partial);
  }
}
