import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  getRepositoryToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ProductsModule } from './../src/products/products.module';
import { Repository } from 'typeorm';
import { Product } from './../src/products/entities/product';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let productRepo: Repository<Product>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    productRepo = moduleFixture.get(getRepositoryToken(Product));
  });

  beforeEach(async () => {
    await productRepo.clear();
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer()).get('/products').expect(200).expect([]);
  });
});
