# INIT-DB IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM alpine:3.14

ARG NODEJS_VER=14
ENV NODEJS_VER=$NODEJS_VER
ARG TINI_VER=0.19
ENV TINI_VER=$TINI_VER
ARG POSTGRES_CLIENT_VER=13
ENV POSTGRES_CLIENT_VER=$POSTGRES_CLIENT_VER

RUN apk add --no-cache \
  jq~=1 \
  nodejs~="$NODEJS_VER" \
  postgresql-client~="$POSTGRES_CLIENT_VER" \
  tini~="$TINI_VER" \
  curl~=7
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

WORKDIR /usr/src/db/
COPY tools/scripts/package-subset.js ./tools/scripts/
COPY subset.config.js ./
COPY package.json ./
RUN node ./tools/scripts/package-subset.js db-dev subset.config.js package.json package.json
RUN pnpm install
COPY apps/db/src/app ./apps/db/src/app
COPY apps/db/src/app/scripts ./apps/db/src/app/scripts
