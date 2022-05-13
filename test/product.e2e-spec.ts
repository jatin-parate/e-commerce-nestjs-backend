import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/products/entities/product';
import faker from '@faker-js/faker';
import { AuthService } from '../src/auth/auth.service';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let usersRepo: Repository<User>;
  let productsRepo: Repository<Product>;
  let user: User;
  let userData: Pick<User, 'email' | 'password' | 'name'>;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    authService = moduleFixture.get<AuthService>(AuthService);
    usersRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    productsRepo = moduleFixture.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    userData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.internet.userName(),
    };
    user = await usersRepo.save({
      ...userData,
      password: await authService.hashPassword(userData.password),
    });
  });

  beforeEach(async () => {
    await productsRepo.clear();
  });

  describe('/ (GET)', () => {
    it('should return an empty array', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });

    it('should return an array with one product', async () => {
      const products = await Promise.all(
        [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(async () =>
          productsRepo.save(
            new Product({
              name: faker.commerce.productName(),
              description: faker.lorem.sentence(),
              price: parseInt(faker.commerce.price(), 10),
              isActive: true,
              quantity: faker.datatype.number({ min: 1 }),
            }),
          ),
        ),
      );

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(HttpStatus.OK);
      expect(response.body).toHaveLength(products.length);
    });

    it('should return an array of non active products', async () => {
      await Promise.all(
        [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(async () =>
          productsRepo.save(
            new Product({
              name: faker.commerce.productName(),
              description: faker.lorem.sentence(),
              price: parseInt(faker.commerce.price(), 10),
              isActive: faker.datatype.boolean(),
              quantity: faker.datatype.number({ min: 1 }),
            }),
          ),
        ),
      );

      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ isActive: false })
        .expect(HttpStatus.OK);
      for (const product of response.body) {
        expect(product.isActive).toBe(false);
      }
    });

    it('should return an array of products of matching product names', async () => {
      const products = await Promise.all(
        [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(async () =>
          productsRepo.save(
            new Product({
              name: faker.commerce.productName(),
              description: faker.lorem.sentence(),
              price: parseInt(faker.commerce.price(), 10),
              isActive: faker.datatype.boolean(),
              quantity: faker.datatype.number({ min: 1 }),
            }),
          ),
        ),
      );

      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ search: products[0].name })
        .expect(HttpStatus.OK);
      for (const product of response.body) {
        expect(product.name).toBe(products[0].name);
      }
    });
  });
});
