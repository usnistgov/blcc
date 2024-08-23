#!/bin/bash

file="/docker-entrypoint-initdb.d/dump.pgdata"
dbname=PV2

echo "Initializing database"
pg_restore -U admin --dbname=$dbname $file