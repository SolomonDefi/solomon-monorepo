# BASE IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM alpine:3.15

ENV SHELL=/bin/sh
ARG NODEJS_VER=16
ARG TINI_VER=0.19
ENV PNPM_VERSION 6.32.6

RUN apk add --no-cache nodejs~="$NODEJS_VER" tini~="$TINI_VER"

RUN apk add --no-cache \
  curl~=7 \
  npm~=8

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/src

RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

COPY subset.config.js package.json ./
COPY tools/scripts/*-subset.js ./tools/scripts/
COPY nx.json workspace.json tsconfig.base.json ./

# Copy in custom prebuilt packages for M1 support
COPY tools/prebuilds ./tools/prebuilds
