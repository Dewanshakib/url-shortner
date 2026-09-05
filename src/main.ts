import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConsoleLogger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      // json:true,
    }),
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 8000;
  const baseUrl =
    configService.get<string>('BASE_URL')?.replace(/\/$/, '') ??
    `http://localhost:${port}`;

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

  // swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('REST API documentation for the URL Shortener service')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter a JWT token (without the `Bearer ` prefix).',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // global http-exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);

  const baseApiUrl = `${baseUrl}/api/v1`;
  const swaggerUrl = `${baseUrl}/docs`;
  console.log('\n========================================');
  console.log('  URL Shortener API is running');
  console.log('----------------------------------------');
  console.log(`  Base API URL : ${baseApiUrl}`);
  console.log(`  Swagger Docs : ${swaggerUrl}`);
  console.log('========================================\n');
}
bootstrap();
