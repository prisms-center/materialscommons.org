#!/usr/bin/env bash

# Note: often this will be redundant, but it simplifies use
# source to set all environment variables for the type of server
export SERVERTYPE=test

export MC_DEPLOY_DIR=/var/www/test/materialscommons.org
export MC_API_SERVICE_PORT=6004
export MCSERV_PORT=6052
export MCDB_PORT=50815
export MCDB_CONNECTION="localhost:$MCDB_PORT"
export MCDB_DIR=/var/db/materialscommons/testdb
export RETHINKDB_HTTP_PORT=9090
export RETHINKDB_CLUSTER_PORT=51815

export MCSTOREDBIN=${MC_DEPLOY_DIR}/prodbin/mcstored
export MCSERVBIN=${MC_DEPLOY_DIR}/prodbin/mcserv
export MCETLBIN=${MC_DEPLOY_DIR}/prodbin/mcetl

export MC_ES_URL="http://localhost:9800"
export MC_ES_NAME="mc-es-test"
export MC_LOG_DIR=/var/log/materialscommons/test

if [ "$MCDB_FILE" = "" ]; then
    export MCDB_FILE=~/test_data/rethinkdb_dump_test_data.tar.gz
fi

export MCDIR=~/mcdir/mcfs/data/test:/mcfs/data/test:/mcfs/data/materialscommons
export MCFS_HTTP_PORT=6012

if [ ! -d ${MCDB_DIR} ]; then
    mkdir -p ${MCDB_DIR}
fi

if [ "$REINIT" = "t" ]; then
    (cd ${MCDB_DIR}; rm -rf rethinkdb_data)
fi

export MCAPID_COMMAND="npx actionhero start cluster --workerTitlePrefix=mcapid-${SERVERTYPE}"
export MCAPID_PORT=6028
export REDIS_PORT=7379

if [ -f /etc/materialscommons/config.test ]; then
    . /etc/materialscommons/config.test
fi

# see also the override file /etc/materialscommons/config.test