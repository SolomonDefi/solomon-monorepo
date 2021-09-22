# BASE IMAGE (37.4MB)
# ------------------------------------------------------------------------------------
FROM alpine:3.14 as base

ARG NODEJS_VER=14
ARG NPM_VER=7
ARG TINI_VER=0.19

ENV NODEJS_VER=$NODEJS_VER
ENV NPM_VER=$NPM_VER
ENV TINI_VER=$TINI_VER

RUN apk add --no-cache nodejs~="$NODEJS_VER" tini~="$TINI_VER"
RUN apk add --no-cache curl~=7 npm~="$NPM_VER"
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

# MAILER: DEV IMAGE (930 MB)
# ------------------------------------------------------------------------------------
FROM base as dev

ENV SHELL=/bin/sh
ENV NODE_ENV=developemnt

WORKDIR /usr/src

COPY apps/blockchain-mailer ./apps/blockchain-mailer
COPY libs ./libs

COPY .editorconfig ./
COPY .eslintrc.json ./
COPY .gitignore ./
COPY .prettierignore ./
COPY .prettierrc ./
COPY jest.config.js ./
COPY jest.preset.js ./
COPY nx.json ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY release.config.js ./
COPY tsconfig.base.json ./
COPY workspace.json ./

RUN pnpm install

ENTRYPOINT ["/sbin/tini", "-v", "--"]
CMD ["pnpm", "exec", "nx", "serve", "blockchain-mailer"]

# MAILER: PROD IMAGE (212.4 MB)
# ------------------------------------------------------------------------------------
FROM base as prod

ENV SHELL=/bin/sh
ENV NODE_ENV=production

WORKDIR /usr/src

COPY apps/blockchain-mailer ./apps/blockchain-mailer
COPY libs ./libs

COPY nx.json ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./
COPY workspace.json ./

RUN pnpm install --production

ENTRYPOINT ["/sbin/tini", "-v", "--"]
CMD ["echo", "todo: run server here without nx"]
