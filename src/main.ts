import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: new ConsoleLogger({
      // json:true,
    })
  });
  app.setGlobalPrefix("/api/v1");
  app.useGlobalPipes(new ValidationPipe({
     whitelist: true,
  }));
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
