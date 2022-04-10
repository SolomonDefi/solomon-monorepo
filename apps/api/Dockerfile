ARG SOLOMON_BASE

# DEV API BUILD IMAGE (?MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as build.dev

RUN node ./tools/scripts/workspace-subset.js api subset.config.js workspace.json workspace.json
RUN node ./tools/scripts/package-subset.js api subset.config.js package.json package.json

RUN pnpm install

COPY hardhat.config.ts ./
COPY apps/api/tsconfig*.json ./apps/api/
COPY apps/api/project.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY libs/api ./libs/api
COPY libs/backend ./libs/backend
COPY libs/shared ./libs/shared

# DEV API APP IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM build.dev as dev
ARG SOLOMON_DEV_NAMESPACE
ENV SOLOMON_DEV_NAMESPACE=$SOLOMON_DEV_NAMESPACE
ENTRYPOINT ["/sbin/tini", "-v", "--"]
CMD ["pnpm", "exec", "nx", "serve", "api", "--skip-nx-cache", "--inspect=false"]

# PRODUCTION API BUILD IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM build.dev as build.prod
RUN pnpm exec nx build api --configuration=production

# PRODUCTION API APP IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE AS prod
# Super secrets populated from GitHub environment
# ...
WORKDIR /usr/src
COPY --from=build.prod --chown=app:app /usr/src/dist/apps/api dist/apps/api
COPY --from=build.prod --chown=app:app /usr/src/node_modules ./node_modules
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "-v", "--"]
CMD ["node", "./dist/apps/api/main.js"]
