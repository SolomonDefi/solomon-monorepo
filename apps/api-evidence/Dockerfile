ARG SOLOMON_BASE

# API EVIDENCE DEV APP IMAGE (? GB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY package.json ./
RUN node ./tools/scripts/package-subset.js api-evidence subset.config.js package.json package.json
RUN pnpm install

COPY apps/api-evidence ./apps/api-evidence
COPY apps/api-evidence/.env.dist ./apps/api-evidence/src/.env

RUN cd /usr/src/apps/api-evidence \
    && poetry config virtualenvs.in-project true \
    && poetry install --no-dev

CMD ["pnpm", "nx", "serve", "api-evidence"]
