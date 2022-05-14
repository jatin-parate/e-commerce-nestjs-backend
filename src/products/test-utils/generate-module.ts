import { Test } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../entities/product';
import { Type } from '@nestjs/common';

export default function generateTestModule(controllers?: Type<any>[]) {
  return Test.createTestingModule({
    providers: [ProductsService],
    controllers,
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
            synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
          } as TypeOrmModuleOptions;
        },
      }),
      TypeOrmModule.forFeature([Product]),
    ],
  });
}
