import '../../test/setup';
import { TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product';
import { Repository } from 'typeorm';
import faker from '@faker-js/faker';
import generateTestModule from './test-utils/generate-module';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', function () {
  let module: TestingModule;
  let controller: ProductsController;
  let productsRepo: Repository<Product>;

  beforeAll(async () => {
    module = await generateTestModule([ProductsController]).compile();

    await module.init();
    controller = module.get<ProductsController>(ProductsController);
    productsRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('delete', () => {
    it('should be defined', () => {
      expect(controller.delete).toBeDefined();
    });

    it('should fail if product does not exists', async () => {
      await expect(controller.delete(faker.datatype.number())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should fail if product is already soft deleted', async () => {
      const [product] = await global.generateRandomProduct(productsRepo);
      await productsRepo.softDelete(product.id);

      await expect(controller.delete(product.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should soft delete the product', async () => {
      const [product] = await global.generateRandomProduct(productsRepo);
      await expect(controller.delete(product.id)).resolves.toBeUndefined();
    });
  });
});
