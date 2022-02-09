# INIT-DB IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM alpine:3.15

ARG NODEJS_VER=16
ENV NODEJS_VER=$NODEJS_VER
ARG TINI_VER=0.19
ENV TINI_VER=$TINI_VER

RUN apk add --no-cache \
  jq~=1 \
  nodejs~="$NODEJS_VER" \
  postgresql13-client \
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
