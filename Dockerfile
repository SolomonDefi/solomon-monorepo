# BASE IMAGE (927.6MB)
# ------------------------------------------------------------------------------------
FROM alpine:3.14 as base

ARG NODEJS_VER=14
ARG TINI_VER=0.19

ENV NODEJS_VER=$NODEJS_VER
ENV TINI_VER=$TINI_VER
ENV SHELL=/bin/sh

WORKDIR /usr/src

COPY nx.json ./
COPY package.json ./
COPY tsconfig.base.json ./
COPY workspace.json ./

RUN apk add --no-cache nodejs~="$NODEJS_VER" tini~="$TINI_VER" curl~=7
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app
RUN pnpm install

# MAILER: DEV IMAGE (929.95 MB)
# ------------------------------------------------------------------------------------
FROM base as dev

ENV NODE_ENV=developemnt

COPY apps/blockchain-mailer ./apps/blockchain-mailer
COPY libs ./libs

ENTRYPOINT ["/sbin/tini", "-v", "--"]
CMD ["pnpm", "exec", "nx", "serve", "blockchain-mailer"]

# MAILER: PROD IMAGE (931.99 MB)
# ------------------------------------------------------------------------------------
FROM base as prod

ENV NODE_ENV=production

COPY apps/blockchain-mailer ./apps/blockchain-mailer
COPY libs ./libs

RUN pnpm exec nx build blockchain-mailer

ENTRYPOINT ["/sbin/tini", "-v", "--"]
CMD ["node", "./dist/apps/blockchain-mailer/main.js"]
