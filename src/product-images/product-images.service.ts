import { Injectable } from '@nestjs/common';
import { ProductImage } from './entities/product-image.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductImageDto } from './dtos/create-product-image.dto';
import { Product } from '../products/entities/product';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,
  ) {}

  async create(product: Product, { imageUrl }: CreateProductImageDto) {
    const image = new ProductImage({
      imageUrl,
    });
    image.product = product;
    await this.productImageRepo.save(image);
  }

  async remove(image: ProductImage) {
    await this.productImageRepo.remove(image);
  }
}
