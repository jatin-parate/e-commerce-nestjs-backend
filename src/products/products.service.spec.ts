import '../../test/setup';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import faker from '@faker-js/faker';

import { Product } from './entities/product';
import { ProductsService } from './products.service';
import { Repository } from 'typeorm';
import { SortDirection } from './dtos/get-all-products-query.dto';
import generateTestModule from './test-utils/generate-module';

describe('ProductsService', () => {
  let service: ProductsService | undefined;
  let module: TestingModule | undefined;
  let productRepo: Repository<Product>;

  beforeEach(async () => {
    module = await generateTestModule().compile();

    await module.init();

    service = module.get<ProductsService>(ProductsService);
    productRepo = module.get(getRepositoryToken(Product));
  });

  beforeEach(async () => {
    await productRepo.clear();
  });

  afterEach(() => {
    module?.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should fail if no product passed', async () => {
      await expect((service.create as any)()).rejects.toThrow();
    });

    it('should fail if empty object is passed', async () => {
      await expect((service.create as any)({})).rejects.toThrow();
    });

    it('should create product', async () => {
      const productData = global.generateRandomProductData();
      const { id } = await service.create(productData as any);
      const product = await productRepo.findOne(id);

      expect(product).toMatchObject(productData);
      expect(product.id).toBeDefined();
      expect(product.createdAt).toBeDefined();
      expect(product.createdAt).toBeDefined();
      expect(product.deletedAt).toBeFalsy();
    });
  });

  describe('findAll', () => {
    it('should return empty array if no products', async () => {
      const products = await service.findAll({
        isActive: true,
        sort: 'name',
        order: SortDirection.DESC,
        limit: 10,
      });

      expect(products).toEqual([]);
    });

    it('should return products', async () => {
      const totalProducts = faker.datatype.number({ min: 1, max: 10 });
      await Promise.all(
        Array.from({ length: totalProducts }, () =>
          global.generateRandomProduct(productRepo),
        ),
      );

      const products = await service.findAll({
        isActive: true,
        sort: 'name',
        order: SortDirection.DESC,
        limit: 10,
      });

      for (const product of products) {
        expect(product).toMatchObject({
          name: expect.any(String),
          price: expect.any(Number),
          description: expect.any(String),
          quantity: expect.any(Number),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          deletedAt: null,
          id: expect.any(Number),
        });
      }
    }, 30000);

    it('should not return deleted and inActive products', async () => {
      const totalProducts = faker.datatype.number({ min: 1, max: 10 });
      await Promise.all(
        Array.from({ length: totalProducts }, () =>
          global.generateRandomProduct(productRepo, {
            isActive: faker.datatype.boolean(),
            deletedAt: faker.datatype.boolean()
              ? faker.datatype.datetime({ max: Date.now() })
              : null,
          }),
        ),
      );

      const products = await service.findAll({
        isActive: false,
        sort: 'name',
        order: SortDirection.DESC,
        limit: 10,
      });

      for (const product of products) {
        expect(product).toMatchObject({
          name: expect.any(String),
          price: expect.any(Number),
          description: expect.any(String),
          quantity: expect.any(Number),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          deletedAt: null,
          isActive: true,
          id: expect.any(Number),
        });
      }
    }, 30000);
  });

  describe('getById', function () {
    it('should return valid product', async () => {
      const [product] = await global.generateRandomProduct(productRepo);
      const { id } = product;

      const foundProduct = await service.getNonDeletedById(id);

      expect(foundProduct).toMatchObject(product);
    });

    it('should return null if product not found', async () => {
      const foundProduct = await service.getNonDeletedById(
        faker.datatype.number(),
      );

      expect(foundProduct).toBeUndefined();
    });
  });

  describe('deleteProduct', function () {
    it('should soft delete the product', async () => {
      const [product] = await global.generateRandomProduct(productRepo);

      const result = await service.deleteProduct(product);

      expect(result.affected).toBe(1);

      await expect(
        productRepo.findOne(product.id, { withDeleted: true }),
      ).resolves.toMatchObject({
        deletedAt: expect.any(Date),
      });
    });
  });
});
