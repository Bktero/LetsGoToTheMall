import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('Bootstrap');

/**
 * ValidationPipe that logs validation failures, then falls back to Nest's
 * default error handling (flattened messages, 400 status).
 */
class LoggingValidationPipe extends ValidationPipe {
  public override createExceptionFactory() {
    const defaultFactory = super.createExceptionFactory();
    return (errors: ValidationError[] = []) => {
      const formattedErrors = errors.map((err) => ({
        property: err.property,
        failedValue: err.value,
        constraints: err.constraints,
      }));
      logger.debug(
        `Validation failed for request:\n${JSON.stringify(formattedErrors, null, 2)}`,
      );
      return defaultFactory(errors);
    };
  }
}

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
    .addTag('Lists', 'Shopping lists management')
    .addTag('Items', 'List item management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      tryItOutEnabled: true,
    },
  });

  // Enable global DTO validation (failures are logged to terminal)
  app.useGlobalPipes(
    new LoggingValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
