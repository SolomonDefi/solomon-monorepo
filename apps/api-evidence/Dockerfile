# BASE IMAGE (37.4MB)
# ------------------------------------------------------------------------------------

FROM alpine:3.14.1 AS base
ARG NODEJS_VER=14
ENV NODEJS_VER=$NODEJS_VER
ARG NPM_VER=7
ENV NPM_VER=$NPM_VER
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
FROM base as api_evidence_dev
ENV SHELL=/bin/sh
WORKDIR /usr/src

COPY subset.config.js package.json pnpm-lock.yaml ./
COPY tools/scripts/package-subset.js ./tools/scripts/
RUN node ./tools/scripts/package-subset.js api-evidence subset.config.js package.json package.json
RUN pnpm install

COPY workspace.json nx.json tsconfig*.json ./

COPY apps/api-evidence ./apps/api-evidence
COPY apps/api-evidence/.env.dist ./apps/api-evidence/src/.env

RUN cd /usr/src/apps/api-evidence \
    && poetry config virtualenvs.in-project true \
    && poetry install --no-dev
RUN cd /usr/src/apps/api-evidence/src \
    && poetry run python pre_start.py

ENTRYPOINT ["/sbin/tini", "-v", "-s", "--"]
CMD ["pnpm", "nx", "serve", "api-evidence"]
