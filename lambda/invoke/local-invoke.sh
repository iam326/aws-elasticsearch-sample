#!/bin/bash

set -euo pipefail

cd ../src
npx tsc

npx lambda-local \
  -l dist/index.js \
  -h handler \
  -e ./events/event.json \
  -E '{"ES_ENDPOINT":"http://localhost:9200","ENV_NAME":"local"}'
