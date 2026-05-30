import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('NextCommerce API')
    .setDescription('REST API for the NextCommerce shoe-shop ecommerce platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Health & readiness probes')
    .addTag('auth', 'Authentication (JWT + Google OAuth)')
    .addTag('catalog', 'Products & categories')
    .addTag('cart', 'Shopping cart')
    .addTag('orders', 'Order management')
    .addTag('reviews', 'Product reviews')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`API running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger at http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
