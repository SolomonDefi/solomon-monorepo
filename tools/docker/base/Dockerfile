# BASE IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM alpine:3.14.2

ARG NODEJS_VER=14
ARG TINI_VER=0.19

ENV NODEJS_VER=$NODEJS_VER
ENV TINI_VER=$TINI_VER
ENV SHELL=/bin/sh

WORKDIR /usr/src

RUN apk add --no-cache make g++ nodejs~="$NODEJS_VER" tini~="$TINI_VER" curl~=7
RUN apk add --no-cache python3 py3-pip && ln -sf python3 /usr/bin/python

RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

RUN apk add --no-cache build-base libffi-dev openssl-dev python3-dev rust cargo postgresql-dev
RUN pip3 install --upgrade pip
RUN pip3 install poetry

COPY nx.json ./
COPY subset.config.js package.json ./
COPY tools/scripts/package-subset.js ./tools/scripts/
COPY tsconfig.base.json ./
COPY workspace.json ./

RUN node ./tools/scripts/package-subset.js base subset.config.js package.json package.json
RUN pnpm install

ENTRYPOINT ["/sbin/tini", "-v", "--"]
