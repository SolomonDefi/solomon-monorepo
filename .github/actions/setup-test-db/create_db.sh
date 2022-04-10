#!/bin/bash

set -e
set -u

echo "Creating user and database '$1'"
PGPASSWORD=$POSTGRES_PASSWORD psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -h localhost <<-EOSQL
    CREATE DATABASE $1;
    GRANT ALL PRIVILEGES ON DATABASE $1 TO $POSTGRES_USER;
EOSQL
