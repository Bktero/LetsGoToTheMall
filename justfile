check:
    npm run typecheck
    npm run build
    npm run lint
    npm run format:check
    npm run test
    npm run test:e2e

alias c := check

format:
    npm run format

alias f := format
