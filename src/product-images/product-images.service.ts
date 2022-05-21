import { Injectable } from '@nestjs/common';
import { ProductImage } from './entities/product-image.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductImageDto } from './dtos/create-product-image.dto';
import { Product } from '../products/entities/product';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,
    private readonly s3Service: S3Service,
  ) {}

  async addNewImageToProduct(
    product: Product,
    body: CreateProductImageDto,
    file: Optional<Express.Multer.File>,
  ) {
    if (file) {
      const key = `product_images/${product.id}/${Date.now()}-${
        file.originalname
      }`;
      await this.s3Service.upload(file.buffer, key);
      body.imageUrl = this.s3Service.generateUrl(key);
    }
    const productImage = new ProductImage({
      product,
      imageUrl: body.imageUrl,
    });

    await this.productImageRepo.save(productImage);
  }

  async removeById(id: number) {
    await this.productImageRepo.delete(id);
  }
}
