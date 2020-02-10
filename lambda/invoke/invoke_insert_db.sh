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

aws lambda invoke \
    --function-name ${INSERT_DB_FUNCTION} \
    --payload "{ \"title\": \"${TITLE}\", \"body\": \"${BODY}\" }" \
    response.json
