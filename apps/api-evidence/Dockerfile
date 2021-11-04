ARG SOLOMON_BASE

# API EVIDENCE DEV APP IMAGE (? GB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY package.json ./
RUN node ./tools/scripts/workspace-subset.js api-evidence subset.config.js workspace.json workspace.json
RUN node ./tools/scripts/package-subset.js api-evidence subset.config.js package.json package.json
RUN pnpm install

COPY libs/shared ./libs/shared
COPY apps/api-evidence ./apps/api-evidence
COPY apps/api-evidence/config.toml /root/.config/pypoetry/config.toml
COPY apps/api-evidence/.env.dist ./apps/api-evidence/src/.env

RUN cd /usr/src/apps/api-evidence \
    && poetry export -o requirements.txt --without-hashes \
    && poetry run pip install --no-cache-dir -U pip \
    && poetry run pip install --no-cache-dir -r requirements.txt

CMD ["pnpm", "nx", "serve", "api-evidence"]
