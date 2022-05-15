import '../../test/setup';
import { TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product';
import { Repository } from 'typeorm';
import faker from '@faker-js/faker';
import generateTestModule from './test-utils/generate-module';
import { NotFoundException } from '@nestjs/common';
import UpdateProductBodyDto, {
  UpdateProductDto,
} from './dtos/update-product-body.dto';

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

  describe('updateById', () => {
    const generateRandomData = () => {
      const body = new UpdateProductBodyDto();
      body.product = new UpdateProductDto({
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        description: faker.lorem.paragraph(),
        quantity: faker.datatype.number({ min: 0 }),
        isActive: faker.datatype.boolean(),
        isBestSeller: faker.datatype.boolean(),
      });

      return body;
    };

    it('should fail if product is not found', async () => {
      const body = new UpdateProductBodyDto();
      await expect(
        controller.updateById(body, faker.datatype.number()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update the product', async () => {
      const [product] = await global.generateRandomProduct(productsRepo);
      const body = generateRandomData();

      await controller.updateById(body, product.id);

      const updatedProduct = await productsRepo.findOne(product.id);
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct).toMatchObject(body.product);
    });

    it('should update the product even if product is deleted', async () => {
      const [product] = await global.generateRandomProduct(productsRepo);
      await productsRepo.softDelete(product.id);
      const body = generateRandomData();

      await controller.updateById(body, product.id);

      const updatedProduct = await productsRepo.findOne(product.id, {
        withDeleted: true,
      });
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct).toMatchObject(body.product);
    });
  });
});
