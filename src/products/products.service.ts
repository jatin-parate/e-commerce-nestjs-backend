import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, IsNull, Like, Not, Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { Product } from './entities/product';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(isActive?: boolean, productName?: string): Promise<Product[]> {
    const extraWhereOptions: FindConditions<Product> = {};

    if (productName) {
      extraWhereOptions.name = Like(`%${productName}%`);
    }

    if (isActive === true) {
      extraWhereOptions.isActive = true;
      extraWhereOptions.deletedAt = null;
    } else if (isActive === false) {
      extraWhereOptions.isActive = false;
      extraWhereOptions.deletedAt = Not(IsNull());
    }

    return await this.productRepository.find({
      where: extraWhereOptions,
    });
  }

  async create(product: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(product);
  }
}
