# Claude

## Adapt Your Response To Your Audience

This is a pet project by someone learning TypeScript and NestJS
and relatively new to backend development (even if a seasoned software engineer).

Have this in mind in your response: advice for standard techniques, guide to improve
the person as much as (if not more than) the code.

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
