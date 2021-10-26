ARG SOLOMON_BASE

# WATCHER: DEV IMAGE (929.95 MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY apps/blockchain-watcher ./apps/blockchain-watcher
COPY libs ./libs

COPY package.json ./
RUN node ./tools/scripts/workspace-subset.js blockchain-watcher subset.config.js workspace.json workspace.json
RUN node ./tools/scripts/package-subset.js blockchain-watcher subset.config.js package.json package.json
RUN pnpm install

ENV NODE_ENV=development

CMD ["pnpm", "exec", "nx", "serve", "blockchain-watcher"]

# WATCHER: PROD IMAGE (931.99 MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as production

ENV NODE_ENV=production

RUN pnpm run contract:compile
RUN pnpm exec nx build blockchain-watcher

CMD ["node", "./dist/apps/blockchain-watcher/main.js"]
