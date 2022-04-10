ARG SOLOMON_BASE

# WATCHER: DEV IMAGE (929.95 MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

RUN apk add --no-cache g++ make python3

COPY apps/blockchain-watcher ./apps/blockchain-watcher
COPY libs/blockchain-watcher ./libs
COPY libs/backend ./libs/backend
COPY libs/shared ./libs/shared

RUN node ./tools/scripts/workspace-subset.js blockchain-watcher subset.config.js workspace.json workspace.json
RUN node ./tools/scripts/package-subset.js blockchain-watcher subset.config.js package.json package.json
RUN pnpm install

ENV NODE_ENV=development

CMD ["pnpm", "exec", "nx", "serve", "blockchain-watcher", "--skip-nx-cache", "--inspect=false"]

# WATCHER: PROD IMAGE (931.99 MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as production

ENV NODE_ENV=production

RUN pnpm run contract:compile
RUN pnpm exec nx build blockchain-watcher

CMD ["node", "./dist/apps/blockchain-watcher/main.js"]
