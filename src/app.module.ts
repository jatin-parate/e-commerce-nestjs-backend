import { Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  InjectConnection,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Connection } from 'typeorm';
import { ProductImagesModule } from './product-images/product-images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`,
      isGlobal: true,
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
    ProductsModule,
    UsersModule,
    AuthModule,
    ProductImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationShutdown {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async onApplicationShutdown() {
    // if (this.connection.isConnected) {
    //   await this.connection.close();
    // }
  }
}
