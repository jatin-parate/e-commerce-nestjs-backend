import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IProductImage } from '../types/product-image.interface';
import { Product } from '../../products/entities/product';

@Entity()
export class ProductImage implements IProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @OneToOne(() => Product, (product) => product.image, { onDelete: 'CASCADE' })
  product: Product;

  constructor(partial: Partial<ProductImage>) {
    Object.assign(this, partial);
  }
}
