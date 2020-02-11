#!/bin/bash

set -euo pipefail

source ../config.sh

TABLES=$(aws dynamodb list-tables \
  --endpoint-url "${LOCAL_DYNAMODB_ENDPOINT}" \
  | jq -r '.TableNames[]' \
)

for TABLE in ${TABLES}; do
  echo "create ${TABLE} table ..."
  aws dynamodb delete-table \
    --table-name ${TABLE} \
     --endpoint-url ${LOCAL_DYNAMODB_ENDPOINT}
done
