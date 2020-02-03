#!/bin/bash

set -euo pipefail

readonly PROJECT_NAME="aws-elasticsearch-sample"
readonly STACK_NAME="${PROJECT_NAME}-lambda"
readonly TEMPLATE_FILE="$(pwd)/template.yaml"
readonly BUCKET_NAME="iam326.${PROJECT_NAME}"

cd ./src
npx tsc
cp ./package.json ./dist
cp ./yarn.lock ./dist
yarn --cwd ./dist install --production

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
  --tags date="$(date '+%Y%m%d%H%M%S')"

rm packaged-template.yml
