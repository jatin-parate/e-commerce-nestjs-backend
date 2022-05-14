import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Roles, User } from '../src/users/entities/user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/products/entities/product';
import faker from '@faker-js/faker';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let usersRepo: Repository<User>;
  let productsRepo: Repository<Product>;
  let user: User;
  let userData: Pick<User, 'email' | 'password' | 'name'>;
  let authService: AuthService;
  let jwtService: JwtService;
  let token: string;
  let adminUser: User;
  let adminToken: string;

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
    jwtService = moduleFixture.get<JwtService>(JwtService);
    productsRepo = moduleFixture.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    await usersRepo.clear();
    userData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.internet.userName(),
    };
    user = await usersRepo.save({
      ...userData,
      password: await authService.hashPassword(userData.password),
    });
    token = jwtService.sign({
      email: user.email,
      id: user.id,
      role: user.role,
    });
    adminUser = await usersRepo.save({
      email: faker.internet.email(),
      name: faker.internet.userName(),
      password: await authService.hashPassword(userData.password),
      role: Roles.ADMIN,
    });
    adminToken = jwtService.sign({
      email: adminUser.email,
      id: adminUser.id,
      role: Roles.ADMIN,
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

  describe('/ (POST)', () => {
    it('should fail if not authorized', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail if user is not admin', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail if user is admin and no product is provided', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send()
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create product in db', async () => {
      const productData: Partial<Product> = {
        name: faker.commerce.productName(),
        price: faker.datatype.number({ min: 0 }),
        quantity: faker.datatype.number({ min: 0 }),
        description: faker.lorem.sentence(),
      };
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(HttpStatus.CREATED);
      await expect(productsRepo.findOne(productData)).resolves.toMatchObject({
        ...productData,
        isActive: false,
      });
    });
  });

  describe('/:id (DELETE)', () => {
    it('should fail if not authorized', async () => {
      await request(app.getHttpServer())
        .delete('/products/' + faker.datatype.number({ min: 0 }))
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail if user is not admin', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${faker.datatype.number({ min: 0 })}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail if product does not exists', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${faker.datatype.number({ min: 0 })}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should soft delete exact product', async () => {
      const [product] = await global.generateRandomProduct(productsRepo);

      await request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      const productFromDb = await productsRepo.findOneOrFail(product.id, {
        withDeleted: true,
      });
      expect(productFromDb.deletedAt).toBeDefined();
    });
  });
});
