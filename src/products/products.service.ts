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

  async findAll(
    {
      isActive,
      search: productName,
      limit,
      sort,
      order,
    }: GetAllProductsQueryDto,
    relations: string[] = [],
  ): Promise<Product[]> {
    const extraWhereOptions: FindConditions<Product> = {};

    if (productName) {
      extraWhereOptions.name = Like(`%${productName}%`);
    }

    if (isActive === true) {
      extraWhereOptions.isActive = true;
      extraWhereOptions.deletedAt = undefined;
    } else if (isActive === false) {
      extraWhereOptions.isActive = false;
      extraWhereOptions.deletedAt = Not(IsNull());
    }

    extraWhereOptions.quantity = Not(0);

    return await this.productRepository.find({
      where: extraWhereOptions,
      take: limit,
      order: {
        [sort]: order,
      },
      relations,
    });
  }

  async create(product: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(product);
  }

  async getNonDeletedById(id: number): Promise<Product | undefined> {
    return await this.productRepository.findOne(id);
  }

  async getByIdEvenIfDeleted(
    id: number,
    relations: string[] = [],
  ): Promise<Product | undefined> {
    return await this.productRepository.findOne(id, {
      withDeleted: true,
      relations,
    });
  }

  async deleteProduct(product: Product): Promise<UpdateResult> {
    return await this.productRepository.softDelete(product.id);
  }

  async update(
    productId: Product['id'],
    { quantityUpdate, ...updateData }: UpdateProductDto,
  ): Promise<Optional<Product>> {
    let product: Product | undefined;
    await this.productRepository.manager.transaction(async (entityManager) => {
      product = await entityManager.findOne(Product, productId, {
        withDeleted: true,
      });
      if (!product) {
        return;
      }
      Object.assign(product, updateData);
      if (quantityUpdate && product.quantity + quantityUpdate >= 0) {
        product.quantity += quantityUpdate;
      }
      await entityManager.save(product);
    });
    return product;
  }
}
