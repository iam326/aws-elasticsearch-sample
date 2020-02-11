#!/bin/bash

set -euo pipefail

source ../config.sh

readonly STACK_NAME="${PROJECT_NAME}-lambda"
readonly TEMPLATE_FILE="$(pwd)/template.yaml"

ES_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "${PROJECT_NAME}-es" \
  --query 'Stacks[].Outputs[?OutputKey==`ElasticSearchDomainEndpoint`].OutputValue' \
  --output text
)

cd ./src
npx tsc

mkdir -p ./nodejs
cp ./package.json ./yarn.lock ./nodejs
yarn --cwd ./nodejs install --production --force
zip -r layer.zip ./nodejs
aws s3 cp ./layer.zip "s3://${BUCKET_NAME}"
rm layer.zip

LAYER_VERSION=$(aws s3api head-object \
  --bucket ${BUCKET_NAME} \
  --key layer.zip \
  --query VersionId \
  --output text \
)

aws cloudformation validate-template \
  --template-body "file://${TEMPLATE_FILE}"

aws cloudformation package \
    --template-file ${TEMPLATE_FILE} \
    --s3-bucket ${BUCKET_NAME} \
    --output-template-file packaged-template.yml

aws cloudformation deploy \
  --stack-name ${STACK_NAME} \
  --template-file packaged-template.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    BucketName=${BUCKET_NAME} \
    TableName=${TABLE_NAME} \
    IndexName=${INDEX_NAME} \
    LayerVersion=${LAYER_VERSION} \
    InsertDBFunctionName=${INSERT_DB_FUNCTION} \
    InsertESFunctionName=${INSERT_ES_FUNCTION} \
    SearchESFunctionName=${SEARCH_ES_FUNCTION} \
    ElasticsearchEndpoint="https://"${ES_ENDPOINT}

rm packaged-template.yml
