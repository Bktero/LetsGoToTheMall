# Claude

## Format Code

After each batch of changes, format the code with `npm run format`.

## Lint Code

After each batch of changes, lint the code with `npm run lint`.

## Check That Code Is Valid

After each batch of changes, check that code is valid with `npm run build`.

## Verify Framework Behavior Claims

Before claiming what a framework or plugin does (e.g. what `@nestjs/swagger` infers), verify it against the generated
output (e.g. `/docs-json`) instead of asserting from memory.

## Prefer local temp directory to system directory

Instead of using `/tmp` to create temporary file, prefer `.tmp` to avoid prompting for authorization.
