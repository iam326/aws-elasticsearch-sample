#!/bin/bash

set -euo pipefail

readonly PROJECT_NAME="aws-elasticsearch-sample"
readonly STACK_NAME="${PROJECT_NAME}-lambda"
readonly TEMPLATE_FILE="$(pwd)/template.yaml"
readonly BUCKET_NAME="s3://iam326.${PROJECT_NAME}"

# aws s3 mb ${BUCKET_NAME}
cd ./src
npx tsc ./index.ts
zip -j ./src.zip ./*
aws s3 cp ./src.zip "${BUCKET_NAME}/src.zip"
rm ./src.zip
cd ..

aws cloudformation validate-template \
  --template-body "file://${TEMPLATE_FILE}"

aws cloudformation deploy \
  --stack-name ${STACK_NAME} \
  --template-file ${TEMPLATE_FILE} \
  --capabilities CAPABILITY_NAMED_IAM \
  --tags date="$(date '+%Y%m%d%H%M%S')"
