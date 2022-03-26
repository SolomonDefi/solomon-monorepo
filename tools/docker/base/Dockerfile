# BASE IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM python:3.10-alpine3.15

ARG NODEJS_VER=16
ARG TINI_VER=0.19

ENV NODEJS_VER=$NODEJS_VER
ENV TINI_VER=$TINI_VER
ENV SHELL=/bin/sh

WORKDIR /usr/src

RUN apk add --no-cache git make g++ nodejs~="$NODEJS_VER" tini~="$TINI_VER" curl~=7

RUN apk add --no-cache py3-pip

RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

RUN apk add --no-cache build-base libffi-dev openssl-dev python3-dev rust cargo postgresql13-dev
RUN pip3 install --no-cache-dir --upgrade pip
RUN pip3 install --no-cache-dir poetry

COPY subset.config.js package.json ./
COPY tools/scripts/*-subset.js ./tools/scripts/
COPY nx.json workspace.json tsconfig.base.json ./

RUN node ./tools/scripts/package-subset.js base subset.config.js package.json package.json
RUN pnpm install

COPY hardhat.config.ts ./

ENTRYPOINT ["/sbin/tini", "-v", "--"]
