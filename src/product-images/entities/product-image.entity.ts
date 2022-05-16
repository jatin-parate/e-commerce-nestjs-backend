import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IProductImage } from '../types/product-image.interface';
import { Product } from '../../products/entities/product';

@Entity()
export class ProductImage implements IProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;

  constructor(partial: Partial<ProductImage>) {
    Object.assign(this, partial);
  }
}
