import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindConditions,
  IsNull,
  Like,
  Not,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { Product } from './entities/product';
import { GetAllProductsQueryDto } from './dtos/get-all-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll({
    isActive,
    search: productName,
    limit,
    sort,
    order,
  }: GetAllProductsQueryDto): Promise<Product[]> {
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
      take: limit,
      order: {
        [sort]: order,
      },
    });
  }

  async create(product: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(product);
  }

  async getNonDeletedById(id: number): Promise<Product | undefined> {
    return await this.productRepository.findOne(id);
  }

  async deleteProduct(product: Product): Promise<UpdateResult> {
    return await this.productRepository.softDelete(product.id);
  }
}
