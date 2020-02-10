#!/bin/bash

set -euo pipefail

source ../../config.sh

CMDNAME=`basename $0`
BODY=""
ENV_NAME=""

while getopts b:e: OPT
do
  case ${OPT} in
    "b" ) BODY="${OPTARG}" ;;
    "e" ) ENV_NAME="${OPTARG}" ;;
      * ) echo "Usage: ${CMDNAME} [-b BODY] [-e ENV_NAME]" 1>&2
          exit 1 ;;
  esac
done

if [ -z "${BODY}" ]; then
  echo "Usage: ${CMDNAME} [-b BODY] [-e ENV_NAME]" 1>&2
  exit 1
fi

PAYLOAD="{ \"body\": \"${BODY}\" }"

if [ "${ENV_NAME}" = "local" ]; then
  cd ../src
  echo ${PAYLOAD} > ./events/_event.json
  npx tsc
  npx lambda-local \
    -l ./dist/search_es.js \
    -h handler \
    -e ./events/_event.json \
    -E '{"ES_ENDPOINT":"http://localhost:9200","ENV_NAME":"local","ES_INDEX":"index"}'
else
  aws lambda invoke \
      --function-name ${SEARCH_ES_FUNCTION} \
      --payload ${PAYLOAD} \
      response.json
fi
