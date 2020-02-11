#!/bin/bash

set -euo pipefail

source ../../config.sh

CMDNAME=`basename $0`
TITLE=""
BODY=""

display_usage() {
  echo "Usage: ${CMDNAME} [-t TITLE] [-b BODY] [-h]" 1>&2
}

while getopts t:b:h OPT
do
  case ${OPT} in
    "t"     ) TITLE="${OPTARG}" ;;
    "b"     ) BODY="${OPTARG}" ;;
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

if [ -z "${TITLE}" -o -z "${BODY}" ]; then
  display_usage
  exit 1
fi

aws lambda invoke \
    --function-name ${INSERT_DB_FUNCTION} \
    --payload ${PAYLOAD} \
    response.json
