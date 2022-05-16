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
import { UpdateProductDto } from './dtos/update-product-body.dto';

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
      relations: ['image'],
    });
  }

  async create(product: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(product);
  }

  async getNonDeletedById(id: number): Promise<Product | undefined> {
    return await this.productRepository.findOne(id);
  }

  async getByIdEvenIfDeleted(id: number): Promise<Product | undefined> {
    return await this.productRepository.findOne(id, {
      withDeleted: true,
      relations: ['image'],
    });
  }

  async deleteProduct(product: Product): Promise<UpdateResult> {
    return await this.productRepository.softDelete(product.id);
  }

  async update(
    product: Product,
    updateData: UpdateProductDto,
  ): Promise<Product> {
    Object.assign(product, updateData);
    return await this.productRepository.save(product);
  }
}
