# BASE IMAGE (37.4MB)
# ------------------------------------------------------------------------------------

FROM alpine:3.14.2 AS base
ARG NODEJS_VER=14
ENV NODEJS_VER=$NODEJS_VER
ARG TINI_VER=0.19
ENV TINI_VER=$TINI_VER

RUN apk add --no-cache nodejs~="$NODEJS_VER" tini~="$TINI_VER" curl~=7
RUN apk add --no-cache python3 py3-pip && ln -sf python3 /usr/bin/python
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

# Install poetry and relevant deps
RUN apk add --no-cache build-base libffi-dev openssl-dev python3-dev rust cargo postgresql-dev
RUN pip3 install --upgrade pip
RUN pip3 install poetry

# API EVIDENCE DEV APP IMAGE (? GB)
# ------------------------------------------------------------------------------------
FROM base as dev
ENV SHELL=/bin/sh
WORKDIR /usr/src

COPY subset.config.js package.json ./
COPY tools/scripts/package-subset.js ./tools/scripts/
RUN node ./tools/scripts/package-subset.js api-dispute subset.config.js package.json package.json
RUN pnpm install

COPY workspace.json nx.json tsconfig*.json ./

COPY apps/api-dispute ./apps/api-dispute
COPY apps/api-dispute/.env.dist ./apps/api-dispute/src/.env

RUN cd /usr/src/apps/api-dispute \
    && poetry config virtualenvs.in-project true \
    && poetry install --no-dev

ENTRYPOINT ["/sbin/tini", "-v", "-s", "--"]
CMD ["pnpm", "nx", "serve", "api-dispute"]
