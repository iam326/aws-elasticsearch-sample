#!/bin/bash

set -euo pipefail

source ../../config.sh

CMDNAME=`basename $0`
TITLE=""
BODY=""
ENDPOINT=""

display_usage() {
  echo "Usage: ${CMDNAME} [-t TITLE] [-b BODY] [-e ENV_NAME] [-h]" 1>&2
}

while getopts t:b:e:h OPT
do
  case ${OPT} in
    "t"     ) TITLE="${OPTARG}" ;;
    "b"     ) BODY="${OPTARG}" ;;
    "e"     ) ENV_NAME="${OPTARG}" ;;
    "h" | * ) display_usage
              exit 1 ;;
  esac
done

PAYLOAD=$(cat << EOS
{
  "title": "${TITLE}",
  "body": "${BODY}"
}
EOS
)

ENVIRONMENT=$(cat << EOS | jq -c '.'
{
  "ENV_NAME": "local",
  "DB_ENDPOINT": "http://localhost:8000",
  "TABLE_NAME": "${TABLE_NAME}"
}
EOS
)

if [ -z "${TITLE}" -o -z "${BODY}" ]; then
  display_usage
  exit 1
fi

if [ "${ENV_NAME}" = "local" ]; then
  cd ../src
  echo ${PAYLOAD} > ./events/_event.json
  npx tsc
  npx lambda-local \
    -l ./dist/insert_db.js \
    -h handler \
    -e ./events/_event.json \
    -E ${ENVIRONMENT}
else
  aws lambda invoke \
      --function-name ${INSERT_DB_FUNCTION} \
      --payload ${PAYLOAD} \
      response.json
fi
