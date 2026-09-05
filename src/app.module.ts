import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoreModule } from './modules/core.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // config module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    // rate limiter
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'AUTH',
          ttl: Number(config.get('AUTH_TTL')),
          limit: Number(config.get('AUTH_LIMIT')),
        },
        {
          name: 'PROFILE',
          ttl: Number(config.get('PROFILE_TTL')),
          limit: Number(config.get('PROFILE_LIMIT')),
        },
        {
          name: 'LOGOUT',
          ttl: Number(config.get('LOGOUT_TTL')),
          limit: Number(config.get('LOGOUT_LIMIT')),
        },
        {
          name: 'CREATE',
          ttl: Number(config.get('CREATE_TTL')),
          limit: Number(config.get('CREATE_LIMIT')),
        },
        {
          name: 'LIST',
          ttl: Number(config.get('LIST_TTL')),
          limit: Number(config.get('LIST_LIMIT')),
        },
        {
          name: 'REDIRECT',
          ttl: Number(config.get('REDIRECT_TTL')),
          limit: Number(config.get('REDIRECT_LIMIT')),
        },
      ],
    }),

    // database module
    PrismaModule,

    // application module
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
