#!/bin/bash

set -euo pipefail

source ../../config.sh

CMDNAME=`basename $0`
TITLE=""
BODY=""

while getopts t:b: OPT
do
  case ${OPT} in
    "t" ) TITLE="${OPTARG}" ;;
    "b" ) BODY="${OPTARG}" ;;
      * ) echo "Usage: ${CMDNAME} [-t TITLE] [-b BODY]" 1>&2
          exit 1 ;;
  esac
done

if [ -z "${TITLE}" -o -z "${BODY}" ]; then
  echo "Usage: ${CMDNAME} [-t TITLE] [-b BODY]" 1>&2
  exit 1
fi

PAYLOAD="{\"Records\":[{\"dynamodb\":{\"NewImage\":{\"title\":{\"S\":\"${TITLE}\"},\"body\":{\"S\":\"${BODY}\"}}}}]}"
aws lambda invoke \
    --function-name ${INSERT_ES_FUNCTION} \
    --payload ${PAYLOAD} \
    response.json
