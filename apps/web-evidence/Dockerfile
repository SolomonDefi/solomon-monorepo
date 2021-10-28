ARG SOLOMON_BASE

# WEB EVIDENCE DEV APP IMAGE (214 MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY package.json ./
RUN node ./tools/scripts/workspace-subset.js web-evidence subset.config.js workspace.json workspace.json
RUN node ./tools/scripts/package-subset.js web-evidence subset.config.js package.json package.json
RUN pnpm install

COPY libs/web ./libs/web
COPY libs/shared ./libs/shared
COPY apps/web-evidence ./apps/web-evidence

CMD ["pnpm", "exec", "nx", "serve", "web-evidence"]
