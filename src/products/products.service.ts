import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Like, Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { Product } from './entities/product';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAllActiveAndNonDeleted(productName?: string): Promise<Product[]> {
    const extraWhereOptions: FindConditions<Product> = {};

    if (productName) {
      extraWhereOptions.name = Like(`%${productName}%`);
    }

    return await this.productRepository.find({
      where: {
        ...extraWhereOptions,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async create(product: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(product);
  }
}
