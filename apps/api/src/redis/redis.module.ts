import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<Redis | null> => {
        const url = config.get<string>('REDIS_URL');
        if (!url) return null;
        const client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
        try {
          await client.connect();
        } catch {
          new Logger('RedisModule').warn('Redis unavailable — caching disabled');
          return null;
        }
        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
