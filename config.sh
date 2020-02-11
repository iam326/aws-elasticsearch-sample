#!/bin/bash

set -euo pipefail

readonly PROJECT_NAME="aws-elasticsearch-sample"
readonly BUCKET_NAME="iam326.${PROJECT_NAME}"
readonly TABLE_NAME="${PROJECT_NAME}-table"
readonly INSERT_DB_FUNCTION="InsertDataIntoDBLambdaFunction"
readonly INSERT_ES_FUNCTION="InsertDataIntoESLambdaFunction"
readonly SEARCH_ES_FUNCTION="SearchDataFromESLambdaFunction"
readonly LOCAL_DYNAMODB_ENDPOINT=http://localhost:8000
