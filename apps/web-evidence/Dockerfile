ARG SOLOMON_BASE

# WEB EVIDENCE DEV APP IMAGE (214 MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY package.json ./
RUN node ./tools/scripts/package-subset.js web-evidence subset.config.js package.json package.json
RUN pnpm install

COPY libs/web ./libs/web
COPY apps/web-evidence/cypress.json ./apps/web-evidence/
COPY apps/web-evidence/tsconfig*.json ./apps/web-evidence/
COPY apps/web-evidence/index.html ./apps/web-evidence/
COPY apps/web-evidence/vite.config.ts ./apps/web-evidence/
COPY apps/web-evidence/postcss.config.js ./apps/web-evidence/
COPY apps/web-evidence/src ./apps/web-evidence/src

CMD ["pnpm", "exec", "nx", "serve", "web-evidence"]
