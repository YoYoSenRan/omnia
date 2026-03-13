#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE omnia_app;
  GRANT ALL PRIVILEGES ON DATABASE omnia_core TO omnia;
  GRANT ALL PRIVILEGES ON DATABASE omnia_app TO omnia;
EOSQL
