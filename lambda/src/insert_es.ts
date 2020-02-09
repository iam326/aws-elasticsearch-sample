'use strict';

import AWS from 'aws-sdk';
import { Client } from '@elastic/elasticsearch';
const AmazonConnection = require('aws-elasticsearch-connector').AmazonConnection;

AWS.config.update({region: 'ap-northeast-1'});

function connectElasticsearch() {
  const env_name = process.env.ENV_NAME;
  const endpoint = process.env.ES_ENDPOINT;
  if (!env_name || !endpoint) {
    throw 'error';
  }

  let params: any = { node: endpoint };
  if (env_name === 'aws') {
    params.Connection = AmazonConnection;
  }
  return new Client(params);
}

exports.handler = async (event: any, context: any, callback: Function) => {
  const es = connectElasticsearch();
  const index = 'todo';
  const exists = await es.indices.exists({ index })
  if (!exists.body) {
    return;
  }

  const body = event.Records[0].dynamodb.NewImage;
  const result = await es.index({
    index,
    body
  })
  await es.indices.refresh({ index })

  return callback(null, result);
}
