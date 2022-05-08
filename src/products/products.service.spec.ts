import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getRepositoryToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import faker from '@faker-js/faker';

import { Product } from './entities/product';
import { ProductsService } from './products.service';
import { Repository } from 'typeorm';

describe('ProductsService', () => {
  let service: ProductsService | undefined;
  let module: TestingModule | undefined;
  let productRepo: Repository<Product>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [ProductsService],
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              type: configService.get<TypeOrmModuleOptions['type']>('DB_TYPE'),
              host: configService.get<string>('DB_HOST'),
              port: +configService.get<number>('DB_PORT'),
              username: configService.get<string>('DB_USERNAME'),
              password: configService.get<string>('DB_PASSWORD'),
              database: configService.get<string>('DB_DATABASE'),
              autoLoadEntities: true,
              synchronize:
                configService.get<string>('DB_SYNCHRONIZE') === 'true',
            } as TypeOrmModuleOptions;
          },
        }),
        TypeOrmModule.forFeature([Product]),
      ],
    }).compile();

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
      const productData = {
        name: faker.commerce.productName(),
        price: faker.datatype.number(),
        description: faker.random.words(),
        quantity: faker.datatype.number({ min: 0 }),
      };
      const { id } = await service.create(productData as any);
      const product = await productRepo.findOne(id);

      expect(product).toMatchObject(productData);
      expect(product.id).toBeDefined();
      expect(product.createdAt).toBeDefined();
      expect(product.createdAt).toBeDefined();
      expect(product.deletedAt).toBeFalsy();
    });
  });

  describe('findAllActiveAndNonDeleted', () => {
    it('should return empty array if no products', async () => {
      const products = await service.findAllActiveAndNonDeleted();

      expect(products).toEqual([]);
    });

    it('should return products', async () => {
      const totalProducts = faker.datatype.number({ min: 1, max: 10 });
      for (let i = 0; i < totalProducts; i++) {
        await productRepo.save({
          name: faker.commerce.productName(),
          price: faker.datatype.number(),
          description: faker.random.words(),
          quantity: faker.datatype.number({ min: 0 }),
        });
      }

      const products = await service.findAllActiveAndNonDeleted();

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
      for (let i = 0; i < totalProducts; i++) {
        await productRepo.save({
          name: faker.commerce.productName(),
          price: faker.datatype.number(),
          description: faker.random.words(),
          quantity: faker.datatype.number({ min: 0 }),
          isActive: faker.datatype.boolean(),
          deletedAt: faker.datatype.boolean()
            ? faker.datatype.datetime({ max: Date.now() })
            : null,
        });
      }

      const products = await service.findAllActiveAndNonDeleted();

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
});
