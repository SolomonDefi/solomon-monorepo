#!/bin/sh

# Print each command and exit on error
# set -x

DB_SERVICE_HOST=${DB_API_SERVICE_HOST:=localhost}
DB_SERVICE_PORT=${DB_API_SERVICE_PORT:=5432}
DB_USER=${DB_API_USER:=postgres}
DB_CONNECT_OPTS="-h $DB_SERVICE_HOST -p $DB_SERVICE_PORT -U $DB_USER -d postgres"
DB_PASSWORD_FILE=~/.pgpass
DB_PASSWORD_FILE_ENTRY=$DB_SERVICE_HOST:$DB_SERVICE_PORT:*:$DB_USER:$DB_API_PASSWORD
knex_exec=node_modules/.bin/knex
knex_dir=apps/db-api/src/app

# echo "[DEBUG] NODE_ENV=$NODE_ENV"
# echo "[DEBUG] DB_SERVICE_HOST=$DB_SERVICE_HOST"
# echo "[DEBUG] DB_USER=$DB_API_USER"
# echo "[DEBUG] DB_CONNECT_OPTS=$DB_CONNECT_OPTS"

echo "[INFO] Create PG password file if does not exist..."
echo "echo $DB_PASSWORD_FILE_ENTRY"
[ ! -f $DB_PASSWORD_FILE ] && touch $DB_PASSWORD_FILE && chmod 600 $DB_PASSWORD_FILE
grep -q -F $DB_PASSWORD_FILE_ENTRY $DB_PASSWORD_FILE || echo $DB_PASSWORD_FILE_ENTRY >> $DB_PASSWORD_FILE

db_exists=true
echo "[INFO] Check if app DB exists..."
psql $DB_CONNECT_OPTS -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_API_NAME'" | \
  grep -q 1 || db_exists=false

if [[ $NODE_ENV = "dev" && "$db_exists" = true ]]; then
  echo "[INFO] Drop app and test databases in dev environment..."
  # Option #1 (Dropping app database)
  psql $DB_CONNECT_OPTS -c "UPDATE pg_database SET datallowconn = 'false' WHERE datname = '$DB_API_NAME'"
  psql $DB_CONNECT_OPTS -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_API_NAME'"
  psql $DB_CONNECT_OPTS -c "DROP DATABASE $DB_API_NAME"
  # psql $DB_CONNECT_OPTS -c "DROP DATABASE ${DB_API_NAME}_test"
  db_exists=false
fi

if [[ $db_exists != true ]]; then
  echo "[INFO] Create app database..."
  psql $DB_CONNECT_OPTS -c "CREATE DATABASE $DB_API_NAME"
fi

# TODO - commented out knex migrations, we may use something else

# echo "[INFO] Migrate $NODE_ENV app database..."
# NODE_ENV=$NODE_ENV $knex_exec --knexfile $knex_dir/knexfile.js migrate:latest

# # Need to do some extra steps for dev environment
# if [ "$NODE_ENV" = "dev" ]
# then
#   echo "[INFO] Seeding dev database..."
#   NODE_ENV=$NODE_ENV $knex_exec --knexfile $knex_dir/knexfile.js seed:run
  # echo "[INFO] Create test database..."
  # psql $DB_CONNECT_OPTS -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_API_NAME}_test'" | \
  #   grep -q 1 || psql $DB_CONNECT_OPTS -c "CREATE DATABASE ${DB_API_NAME}_test"
  # echo "[INFO] Migrate test database..."
  # NODE_ENV=test $knex_exec --knexfile $knex_dir/knexfile.js migrate:latest
# fi

# echo "[INFO] Initializing of database is complete"
