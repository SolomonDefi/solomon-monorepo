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
RUN apk add --no-cache python3 py3-pip
# Install and configure postgresql 
RUN apk add --no-cache postgresql
RUN (addgroup -S postgres && adduser -S postgres -G postgres || true)
RUN mkdir -p /var/lib/postgresql/data
RUN mkdir -p /run/postgresql/
RUN chown -R postgres:postgres /run/postgresql/
RUN chmod -R 777 /var/lib/postgresql/data
RUN chown -R postgres:postgres /var/lib/postgresql/data
RUN su - postgres -c "initdb /var/lib/postgresql/data"
RUN echo "host all  all    0.0.0.0/0  md5" >> /var/lib/postgresql/data/pg_hba.conf

# Install poetry and relevant deps
RUN apk add --no-cache build-base libffi-dev openssl-dev python3-dev rust cargo postgresql-dev
RUN pip3 install --upgrade pip
RUN pip3 install poetry
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

# API EVIDENCE DEV APP IMAGE (? GB)
# ------------------------------------------------------------------------------------
FROM base as api_evidence_dev
ENV SHELL=/bin/sh
WORKDIR /usr/src

COPY subset.config.js ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tools/scripts/package-subset.js ./tools/scripts/
RUN node ./tools/scripts/package-subset.js api-evidence subset.config.js package.json package.json
RUN pnpm install

COPY workspace.json ./
COPY nx.json ./
COPY tsconfig*.json ./

COPY apps/api-evidence ./apps/api-evidence
COPY apps/api-evidence/.env.dist ./apps/api-evidence/src/.env
COPY apps/api-evidence/run_postgres_api_evidence.sh ./

RUN cd /usr/src/apps/api-evidence/src && \
    poetry install

RUN cd /usr/src/
RUN chmod +x run_postgres_api_evidence.sh
CMD ["sh", "run_postgres_api_evidence.sh"]