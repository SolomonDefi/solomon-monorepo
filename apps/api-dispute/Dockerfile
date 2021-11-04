ARG SOLOMON_BASE

# API EVIDENCE DEV APP IMAGE (? GB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY package.json ./
RUN node ./tools/scripts/workspace-subset.js api-dispute subset.config.js workspace.json workspace.json
RUN node ./tools/scripts/package-subset.js api-dispute subset.config.js package.json package.json
RUN pnpm install

COPY libs/shared ./libs/shared
COPY apps/api-dispute ./apps/api-dispute
COPY apps/api-dispute/config.toml /root/.config/pypoetry/config.toml
COPY apps/api-dispute/.env.dist ./apps/api-dispute/src/.env

RUN cd /usr/src/apps/api-dispute \
    && poetry export -o requirements.txt --without-hashes \
    && poetry run pip install --no-cache-dir -U pip \
    && poetry run pip install --no-cache-dir -r requirements.txt

CMD ["pnpm", "nx", "serve", "api-dispute"]
