check:
    clear
    tsc --noEmit
    npm run build
    npm run lint
    npm run format
    npm run test
    npm run test:e2e
