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

  async addNewImageToProduct(
    product: Product,
    { imageUrl }: CreateProductImageDto,
  ) {
    const productImage = new ProductImage({
      product,
      imageUrl,
    });

    await this.productImageRepo.save(productImage);
  }

  async removeById(id: number) {
    await this.productImageRepo.delete(id);
  }
}
