# Let's Go To The Mall

> "Today!"

A pet project to learn TypeScript and NestJS.

## Environment Variables

- `LGTTM_SEED_DATA`: set to `true` to seed lists with items when the application starts.

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

## Docker

```bash
docker compose build
docker compose push

docker compose pull
docker compose up -d
docker compose log -g
```
