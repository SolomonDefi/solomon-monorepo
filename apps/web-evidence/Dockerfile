# BASE IMAGE (37.4MB)
# ------------------------------------------------------------------------------------
FROM alpine:3.14.1 AS base
ARG NODEJS_VER=14
ENV NODEJS_VER=$NODEJS_VER
ARG NPM_VER=7
ENV NPM_VER=$NPM_VER
ARG TINI_VER=0.19
ENV TINI_VER=$TINI_VER

RUN apk add --no-cache g++ make python3 nodejs~="$NODEJS_VER" tini~="$TINI_VER" curl~=7
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

# WEB EVIDENCE DEV APP IMAGE (214 MB)
# ------------------------------------------------------------------------------------
FROM base as web_evidence_dev
ENV SHELL=/bin/sh
WORKDIR /usr/src

COPY subset.config.js ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tools/scripts/package-subset.js ./tools/scripts/
RUN node ./tools/scripts/package-subset.js web-evidence subset.config.js package.json package.json
RUN pnpm install

COPY workspace.json ./
COPY nx.json ./
COPY tsconfig*.json ./

COPY libs/web ./libs/web
COPY apps/web-evidence/cypress.json ./apps/web-evidence/
COPY apps/web-evidence/tsconfig*.json ./apps/web-evidence/
COPY apps/web-evidence/index.html ./apps/web-evidence/
COPY apps/web-evidence/vite.config.ts ./apps/web-evidence/
COPY apps/web-evidence/postcss.config.js ./apps/web-evidence/
COPY apps/web-evidence/src ./apps/web-evidence/src
ENTRYPOINT ["/sbin/tini", "-v", "--"]
CMD ["pnpm", "exec", "nx", "serve", "web-evidence"]