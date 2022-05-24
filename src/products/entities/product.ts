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
  @Index({ unique: false })
  name!: string;

  @Column()
  price!: number;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  @Index({ unique: false })
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ default: true })
  @Index({ unique: false })
  isActive!: boolean;

  @Column({ default: false })
  isBestSeller!: boolean;

  @Column({ default: 0 })
  quantity!: number;

  @OneToMany(() => ProductImage, (image) => image.product, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  images: ProductImage[];

  constructor(partial?: Partial<Product>) {
    Object.assign(this, partial);
  }
}
