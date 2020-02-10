#!/bin/bash

set -euo pipefail

source ../../config.sh

CMDNAME=`basename $0`
BODY=""

while getopts b: OPT
do
  case ${OPT} in
    "b" ) BODY="${OPTARG}" ;;
      * ) echo "Usage: ${CMDNAME} [-b BODY]" 1>&2
          exit 1 ;;
  esac
done

if [ -z "${BODY}" ]; then
  echo "Usage: ${CMDNAME} [-b BODY]" 1>&2
  exit 1
fi

aws lambda invoke \
    --function-name ${SEARCH_ES_FUNCTION} \
    --payload "{ \"body\": \"${BODY}\" }" \
    response.json
