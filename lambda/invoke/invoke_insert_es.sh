#!/bin/bash

set -euo pipefail

source ../../config.sh

CMDNAME=`basename $0`
TITLE=""
BODY=""
ENV_NAME=""

while getopts t:b:e: OPT
do
  case ${OPT} in
    "t" ) TITLE="${OPTARG}" ;;
    "b" ) BODY="${OPTARG}" ;;
    "e" ) ENV_NAME="${OPTARG}" ;;
      * ) echo "Usage: ${CMDNAME} [-t TITLE] [-b BODY] [-e ENV_NAME]" 1>&2
          exit 1 ;;
  esac
done

if [ -z "${TITLE}" -o -z "${BODY}" ]; then
  echo "Usage: ${CMDNAME} [-t TITLE] [-b BODY] [-e ENV_NAME]" 1>&2
  exit 1
fi

PAYLOAD="{\"Records\":[{\"dynamodb\":{\"NewImage\":{\"title\":{\"S\":\"${TITLE}\"},\"body\":{\"S\":\"${BODY}\"}}}}]}"

if [ "${ENV_NAME}" = "local" ]; then
  cd ../src
  echo ${PAYLOAD} > ./events/_event.json
  npx tsc
  npx lambda-local \
    -l ./dist/insert_es.js \
    -h handler \
    -e ./events/_event.json \
    -E '{"ES_ENDPOINT":"http://localhost:9200","ENV_NAME":"local","ES_INDEX":"index"}'
else
  aws lambda invoke \
      --function-name ${INSERT_ES_FUNCTION} \
      --payload ${PAYLOAD} \
      response.json
fi
