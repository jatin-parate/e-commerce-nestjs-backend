import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAllActiveAndNonDeleted(): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async create(product: Partial<Product>): Promise<Product> {
    return await this.productRepository.save(product);
  }
}
