import { CacheModule, Global, Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          store: redisStore,

          // Store-specific options
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: +configService.get<number>('REDIS_PORT')!,
          },
          isGlobal: true,
          database: +configService.get<number>('REDIS_DATABASE')!,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
