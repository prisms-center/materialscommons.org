#!/usr/bin/env bash

# Note: often this will be redundant, but it simplifies use
# source to set all environment variables for the type of server
export SERVERTYPE=production

export MC_DEPLOY_DIR=/var/www/html/materialscommons.org
export MCDB_PORT=28015
export MCDB_CONNECTION="localhost:$MCDB_PORT"

#### Remove these after update ####
export MC_SERVICE_PORT=5006
export MC_PUB_SERVICE_PORT=5014
export MC_ETL_SERVICE_PORT=5032
###################################

export MC_API_SERVICE_PORT=3006
export MCSERV_PORT=5052
export RETHINKDB_HTTP_PORT=8080
export RETHINKDB_CLUSTER_PORT=29015

export MCSTOREDBIN=${MC_DEPLOY_DIR}/bin/mcstored
export MCSERVBIN=${MC_DEPLOY_DIR}/bin/mcserv
export MCETLBIN=${MC_DEPLOY_DIR}/backend/prodbin/mcetl

export MCDB_DIR=/var/db/materialscommons/proddb
export MC_ES_URL="http://localhost:9200"
export MC_ES_NAME="mc-es"
export MC_LOG_DIR=/var/log/materialscommons/production
export MCDIR=/mcfs/data/materialscommons
export MCFS_HTTP_PORT=5010

export MCAPID_COMMAND="npx actionhero start cluster --workerTitlePrefix=mcapid-${SERVERTYPE}"
export MCAPID_PORT=5016
export REDIS_PORT=6379

if [ -f /etc/materialscommons/config.prod ]; then
    . /etc/materialscommons/config.prod
fi

# see also the override file /etc/materialscommons/config.prod
