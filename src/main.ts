import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './configure-app.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  // Create app
  const app = await NestFactory.create(AppModule, {
    routeConflictPolicy: {
      duplicate: 'error',
      shadow: 'error',
    },
  });

  // Configure OpenAPI
  const config = new DocumentBuilder()
    .setTitle("Let's Go To The Mall API")
    .setDescription(
      'An API to manage shopping lists (so we can go to the mall, today!)',
    )
    .addTag('Lists', 'Manage lists')
    .addTag('Items', 'Manage items inside a list')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      tryItOutEnabled: true,
    },
  });

  // Configure behavior shared with the e2e tests (validation, ...)
  configureApp(app);

  // Listen to incoming connections
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // All done \o/
  const url = new URL(await app.getUrl());
  if (url.hostname === '[::1]' || url.hostname === '127.0.0.1') {
    // Show loopback addresses as "localhost" so terminals make them clickable
    url.hostname = 'localhost';
  }
  logger.log(`Application running on ${url.origin}`);
  logger.log(`Swagger available on ${url.origin}/docs`);
}

await bootstrap();
