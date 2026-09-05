import { Module } from '@nestjs/common';
import { UrlsController } from './urls.controller.js';
import { UrlsService } from './urls.service.js';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ttl: config.get<number>('CACHE_TTL'),
      }),
    }),
  ],
  controllers: [UrlsController],
  providers: [UrlsService],
})
export class UrlsModule {}
