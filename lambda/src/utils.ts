'use strict';

import AWS from 'aws-sdk';
import { Client } from '@elastic/elasticsearch';
const AmazonConnection = require('aws-elasticsearch-connector').AmazonConnection;

AWS.config.update({region: 'ap-northeast-1'});

export function getDynamoDocClient() {
  const env_name = process.env.ENV_NAME;
  if (!env_name) {
    throw 'error';
  }
  const params: any = { region: 'ap-northeast-1' };
  if (env_name === 'local') {
    const endpoint = process.env.DB_ENDPOINT;
    if (!endpoint) {
      throw 'error';
    }
    params.endpoint = endpoint;
  }
  return new AWS.DynamoDB.DocumentClient(params);
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
