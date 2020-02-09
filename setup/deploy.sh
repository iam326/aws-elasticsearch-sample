#!/bin/bash

set -euo pipefail

readonly PROJECT_NAME="aws-elasticsearch-sample"
readonly STACK_NAME="${PROJECT_NAME}-setup"
readonly TEMPLATE_FILE="$(pwd)/template.yaml"
readonly BUCKET_NAME="iam326.${PROJECT_NAME}"

aws cloudformation validate-template \
  --template-body "file://${TEMPLATE_FILE}"

aws cloudformation deploy \
  --stack-name ${STACK_NAME} \
  --template-file ${TEMPLATE_FILE} \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    NamePrefix=${PROJECT_NAME} \
    BucketName=${BUCKET_NAME}
