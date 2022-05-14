import * as pg from 'pg';
import * as path from 'path';
import { config } from 'dotenv';
import { Product } from '../src/products/entities/product';
import faker from '@faker-js/faker';
import { Repository } from 'typeorm';

config({ path: path.resolve('.env.test') });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface generateRandomProductData {
      (overrides?: Partial<Product>): Partial<Product>;
    }

    interface generateRandomProduct {
      (productRepo: Repository<Product>, overrides?: Partial<Product>): Promise<
        [Product, Partial<Product>]
      >;
    }
  }
}

global.generateRandomProductData = (overrides?: Partial<Product>) => ({
  name: faker.commerce.productName(),
  price: faker.datatype.number(),
  description: faker.random.words(),
  quantity: faker.datatype.number({ min: 0 }),
  ...overrides,
});

global.generateRandomProduct = async (
  productRepo: Repository<Product>,
  overrides?: Partial<Product>,
): Promise<[Product, Partial<Product>]> => {
  const productData = global.generateRandomProductData(overrides);
  const product = await productRepo.save(new Product(productData));
  return [product, productData];
};

// Deletes all tables before running tests
export default async function setup() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USERNAME,
  });
  await client.connect();
  const result = await client.query(`SELECT *
      FROM pg_catalog.pg_tables
      WHERE schemaname != 'pg_catalog' AND 
        schemaname != 'information_schema';
  `);
  await Promise.all(
    result.rows.map((row) => {
      return client.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
    }),
  );
  await client.end();
}
