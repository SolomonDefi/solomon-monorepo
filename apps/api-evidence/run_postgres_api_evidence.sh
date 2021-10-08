#!/bin/sh

su - postgres <<EOSU
pg_ctl start -D /var/lib/postgresql/data -l /var/lib/postgresql/log.log
psql --command "ALTER USER postgres WITH ENCRYPTED PASSWORD 'postgres';"
EOSU

cd /usr/src/apps/api-evidence/src
poetry run python pre_start.py

/sbin/tini -v -- pnpm nx serve api-evidence