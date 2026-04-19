#!/bin/sh
# Créé à docker run initial. Crée les rôles demoema_agents + demoema_ro depuis env vars.
set -e

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<SQL
CREATE ROLE demoema_agents LOGIN PASSWORD '${DATALAKE_AGENTS_PASSWORD}';
CREATE ROLE demoema_ro LOGIN PASSWORD '${DATALAKE_RO_PASSWORD}';
SQL

echo "Roles demoema_agents + demoema_ro created."
