ARG SOLOMON_BASE

# API EVIDENCE DEV APP IMAGE (? GB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY package.json ./
RUN node ./tools/scripts/package-subset.js api-dispute subset.config.js package.json package.json
RUN pnpm install

COPY apps/api-dispute ./apps/api-dispute
COPY apps/api-dispute/.env.dist ./apps/api-dispute/src/.env

RUN cd /usr/src/apps/api-dispute \
    && poetry config virtualenvs.in-project true \
    && poetry install --no-dev

CMD ["pnpm", "nx", "serve", "api-dispute"]
