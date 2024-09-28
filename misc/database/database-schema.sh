#!/bin/bash

source ../../ts/.env;

curl -L -o  schemaspy-6.2.4.jar https://github.com/schemaspy/schemaspy/releases/download/v6.2.4/schemaspy-6.2.4.jar
curl -L -o postgresql-42.7.4.jar https://jdbc.postgresql.org/download/postgresql-42.7.4.jar

java -jar schemaspy-6.2.4.jar \
    -t pgsql11 \
    -db $PSQL_DATABASE \
    -host $PSQL_HOST \
    -port 5432 \
    -u $PSQL_USER \
    $([ "$PSQL_PASSWORD" ] && echo '-p' $PSQL_PASSWORD || echo '') \
    -o schemaspy \
    -dp postgresql-42.7.4.jar \
    -vizjs
