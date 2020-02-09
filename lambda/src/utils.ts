'use strict';

import AWS from 'aws-sdk';
import { Client } from '@elastic/elasticsearch';
const AmazonConnection = require('aws-elasticsearch-connector').AmazonConnection;

AWS.config.update({region: 'ap-northeast-1'});

export function getDynamoDocClient() {
  return new AWS.DynamoDB.DocumentClient(
    { region: 'ap-northeast-1' }
  );
}

export function connectElasticsearch() {
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
