# Let's Go To The Mall

> "Today!"

A pet project to learn TypeScript and NestJS.

## Useful Commands

See `justfile`.

## Endpoint Creation

```bash
nest g resource lists
```

## OpenAPI & Swagger

Just add Swagger to the dependencies:

```bash
npm install @nestjs/swagger
```

Configure it in `main.ts`.

For automatic extraction, configure plugin in `nest-cli.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true
        }
      }
    ]
  }
}
```
