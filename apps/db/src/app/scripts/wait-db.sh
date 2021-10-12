#!/bin/sh

# Print each command and exit on error
# set -x

DB_SERVICE_HOST=${DB_API_SERVICE_HOST:=localhost}
DB_SERVICE_PORT=${DB_API_SERVICE_PORT:=5432}
DB_USER=${DB_API_USER:=postgres}
DB_CONNECT_OPTS="-h $DB_SERVICE_HOST -p $DB_SERVICE_PORT -U $DB_USER"

# Wait for the DB service to be up
echo "[INFO] Waiting for database service..."
wait_cmd="pg_isready $DB_CONNECT_OPTS -d postgres"
until $($wait_cmd &>/dev/null)
do
  echo "[INFO] Waiting for the database service to be up..."
  sleep 2
done
echo "DONE"
