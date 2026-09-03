import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConsoleLogger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      // json:true,
    }),
  });

  // global api prefix
  app.setGlobalPrefix('/api/v1', {
    exclude: [{ path: ':shorturl', method: RequestMethod.GET }],
  });

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // global response interceptor
  // app.useGlobalInterceptors();

  // global http-exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT!);
}
bootstrap();
