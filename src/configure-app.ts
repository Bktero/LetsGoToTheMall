import {
  Logger,
  ValidationError,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';

const logger = new Logger('ValidationPipe');

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

/**
 * Apply the configuration that changes how the app behaves over HTTP.
 *
 * It is shared by `main.ts` and the e2e tests so both run the same app.
 */
export function configureApp(app: INestApplication): void {
  // Enable global DTO validation (failures are logged to terminal)
  app.useGlobalPipes(
    new LoggingValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
