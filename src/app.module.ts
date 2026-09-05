import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoreModule } from './modules/core.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // config module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
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
  ],
})
export class AppModule {}
