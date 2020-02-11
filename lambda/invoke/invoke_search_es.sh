#!/bin/bash

set -euo pipefail

source ../../config.sh

CMDNAME=`basename $0`
BODY=""
ENV_NAME=""

display_usage() {
  echo "Usage: ${CMDNAME} [-b BODY] [-h]" 1>&2
}

while getopts b:e:h OPT
do
  case ${OPT} in
    "b"     ) BODY="${OPTARG}" ;;
    "e"     ) ENV_NAME="${OPTARG}" ;;
    "h" | * ) display_usage
              exit 1 ;;
  esac
done

if [ -z "${BODY}" ]; then
  display_usage
  exit 1
fi

PAYLOAD=$(cat << EOS
{ "body": "${BODY}" }
EOS
)

ENVIRONMENT=$(cat << EOS | jq -c '.'
{
  "ENV_NAME": "local",
  "ES_ENDPOINT": "${${LOCAL_ES_ENDPOINT}}",
  "ES_INDEX": "${INDEX_NAME}"
}
EOS
)

if [ "${ENV_NAME}" = "local" ]; then
  cd ../src
  echo ${PAYLOAD} > ./events/_event.json
  npx tsc
  npx lambda-local \
    -l ./dist/search_es.js \
    -h handler \
    -e ./events/_event.json \
    -E ${ENVIRONMENT}
else
  aws lambda invoke \
      --function-name ${SEARCH_ES_FUNCTION} \
      --payload ${PAYLOAD} \
      response.json
fi
