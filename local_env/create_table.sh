#!/bin/bash

set -euo pipefail

source ../config.sh

cat ../lambda/template.yaml \
  | yq '.Resources[] | select(.Type == "AWS::DynamoDB::Table") | .Properties' \
  | yq --arg name ${TABLE_NAME} '. + {TableName: $name}' \
  | yq '. * {StreamSpecification: {StreamEnabled: true}}' \
  > table.json

echo "create ${TABLE_NAME} table ..."
aws dynamodb create-table \
  --cli-input-json "file://$(pwd)/table.json" \
  --endpoint-url ${LOCAL_DYNAMODB_ENDPOINT}
