import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { IProduct } from '../interfaces/product.interface';
import { ProductImage } from '../../product-images/entities/product-image.entity';

@Entity()
export class Product implements IProduct {
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

  @OneToOne(() => ProductImage, (image) => image.product, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  image: ProductImage;

  constructor(partial?: Partial<Product>) {
    Object.assign(this, partial);
  }
}
